// Phase 2: import of the reviewed exam-protocol questions (5_Website_Importpaket.json).
//
//   Dry run (default, only reads the database):
//     npx tsx prisma/phase1/import-phase1.ts --file <5_Website_Importpaket.json> [--report <dir>]
//   Apply (writes; needs the migration applied and a content backup):
//     npx tsx prisma/phase1/import-phase1.ts --file <...json> --apply --backup <backup.json>
//
// Guarantees:
//  - Never updates or deletes rows that do not carry a Phase-1 code (existing questions stay untouched).
//  - Idempotent: re-running updates the same rows (matched by canonicalCode / code), no duplicates.
//  - Imported questions are never PUBLISHED or APPROVED; answers are never marked approved.
//  - No examiner data and no source file names are written.
import "dotenv/config";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import type {
  CitationSourceType,
  ContentStatus,
  VerificationStatus,
} from "../../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ---------- package types (only the fields used here) ----------
type Ref = {
  ref_id: string;
  title: string | null;
  publisher: string | null;
  year_or_update: string | null;
  url: string | null;
  type: string | null;
  verified: boolean;
  verification_note: string | null;
};
type Pkg = {
  meta: { counts: Record<string, number> };
  specialties: { spec_id: string; name: string }[];
  subcategories: { subcategory_id: string; spec_id: string; name: string }[];
  locations: {
    location_id: string;
    ort_document: string | null;
    aerztekammer_document: string | null;
    bundesland_document: string | null;
    bundesland_derived: string | null;
  }[];
  protocols: {
    protocol_id: string;
    source_pages: string | null;
    exam_format: string | null;
    is_german_oral_exam: boolean;
    date_text: string | null;
    year: number | null;
    location_id: string;
    low_confidence: boolean;
  }[];
  canonical_questions: {
    canonical_id: string;
    import_key: string;
    question_de: string;
    specialty_id: string;
    subcategory_id: string;
    secondary_tags: string[];
    frequency: { distinct_protocols: number };
    answer: {
      short_answer: string | null;
      model_answer: string | null;
      follow_up_questions: string[];
      key_points: string[];
    };
    reference_ids: string[];
    evidence: Record<string, string[]>;
    german_vs_international: string | null;
    controversies: string | null;
    review_status: string;
    editorial_notes: string | null;
    correction_ids: string[];
  }[];
  question_occurrences: {
    occurrence_id: string;
    canonical_id: string | null;
    protocol_id: string;
    location_id: string;
    source_pages: string | null;
    original_question: string;
    corrected_question: string | null;
    original_answer_excerpt: string | null;
    flags: string | null;
  }[];
  references: Ref[];
  corrections: {
    correction_id: string;
    canonical_id: string;
    original_statement: string | null;
    corrected_statement: string | null;
    explanation: string | null;
    reference_ids: string[];
    verification_status: string | null;
    needs_specialist_review: boolean;
  }[];
};

// Phase-1 specialty letter -> name of the existing Specialty row (prisma/seed.ts).
const SPECIALTY_BY_LETTER: Record<string, string> = {
  A: "Retina und Glaskörper",
  B: "Glaukom",
  C: "Katarakt und Intraokularlinsen",
  D: "Hornhaut und äußere Augenerkrankungen",
  E: "Uveitis",
  F: "Neuroophthalmologie",
  G: "Kinderophthalmologie und Strabologie",
  H: "Lider, Tränenwege und Orbita",
  I: "Augenverletzungen und Notfälle",
  J: "Refraktion und Optik",
  K: "Diagnostik und Bildgebung",
  L: "Allgemeine Augenheilkunde",
};

const VERIFICATION: Record<string, VerificationStatus> = {
  "Quellen verifiziert": "SOURCE_VERIFIED",
  "Teilweise verifiziert": "PARTIALLY_VERIFIED",
  "Nicht quellenverifiziert (Lehrbuchwissen)": "TEXTBOOK_ONLY",
  "Nicht quellenverifiziert (mathematisch nachgerechnet)": "TEXTBOOK_ONLY",
  "Manuelle Prüfung zwingend": "MANUAL_REVIEW_REQUIRED",
};

const UNKNOWN_LOCATION = "Prüfungsort unbekannt";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function citationType(r: Ref): CitationSourceType {
  const pub = `${r.publisher ?? ""} ${r.title ?? ""}`.toLowerCase();
  const type = r.type ?? "";
  if (type.startsWith("EyeWiki")) return "EYEWIKI";
  if (pub.includes("awmf")) return "AWMF_LEITLINIE";
  if (pub.includes("dog") || pub.includes("bva") || pub.includes("deutsche ophthalmologische")) {
    return type.startsWith("Konsensstatement") ? "DOG_BVA_STELLUNGNAHME" : "DOG_LEITLINIE";
  }
  return "OTHER";
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
const words = (t: string) => new Set(normalize(t).split(" ").filter((w) => w.length > 2));
function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let i = 0;
  for (const w of a) if (b.has(w)) i++;
  return i / (a.size + b.size - i);
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const file = arg("file");
  if (!file) throw new Error("--file <5_Website_Importpaket.json> is required");
  const apply = process.argv.includes("--apply");
  const pkg: Pkg = JSON.parse(readFileSync(file, "utf8"));
  const host = new URL(process.env.DATABASE_URL!).host;
  console.log(`Mode: ${apply ? "APPLY (writes)" : "DRY RUN (read-only)"}  |  database host: ${host}`);

  // ---------- validation of the package ----------
  const problems: string[] = [];
  const refById = new Map(pkg.references.map((r) => [r.ref_id, r]));
  const locById = new Map(pkg.locations.map((l) => [l.location_id, l]));
  const protById = new Map(pkg.protocols.map((p) => [p.protocol_id, p]));
  const subById = new Map(pkg.subcategories.map((s) => [s.subcategory_id, s]));
  const cqIds = new Set(pkg.canonical_questions.map((c) => c.canonical_id));
  const specLetter = (id: string) => id.replace("SPEC-", "");

  for (const c of pkg.canonical_questions) {
    if (!VERIFICATION[c.review_status]) problems.push(`${c.canonical_id}: unknown review_status "${c.review_status}"`);
    if (!SPECIALTY_BY_LETTER[specLetter(c.specialty_id)]) problems.push(`${c.canonical_id}: unknown specialty ${c.specialty_id}`);
    if (!subById.has(c.subcategory_id)) problems.push(`${c.canonical_id}: unknown subcategory`);
    if (!c.answer.model_answer) problems.push(`${c.canonical_id}: no model answer`);
    for (const r of c.reference_ids) if (!refById.has(r)) problems.push(`${c.canonical_id}: unresolved ${r}`);
  }
  for (const o of pkg.question_occurrences) {
    if (!protById.has(o.protocol_id)) problems.push(`${o.occurrence_id}: unknown protocol`);
    if (o.canonical_id && !cqIds.has(o.canonical_id)) problems.push(`${o.occurrence_id}: unknown canonical ${o.canonical_id}`);
  }
  for (const p of pkg.protocols) if (!locById.has(p.location_id)) problems.push(`${p.protocol_id}: unknown location`);
  if (new Set(pkg.question_occurrences.map((o) => o.occurrence_id)).size !== pkg.question_occurrences.length)
    problems.push("duplicate occurrence ids in package");

  // ---------- read-only look at the database ----------
  const specialties = await prisma.specialty.findMany();
  const specialtyIdByName = new Map(specialties.map((s) => [s.name, s.id]));
  for (const name of Object.values(SPECIALTY_BY_LETTER))
    if (!specialtyIdByName.has(name)) problems.push(`Specialty "${name}" missing in database (run seed)`);

  let migrated = true;
  try {
    await prisma.examLocation.count();
  } catch {
    migrated = false;
  }
  const existing = await prisma.question.findMany({ select: { id: true, originalText: true, sourceType: true } });
  const existingPhase1 = migrated
    ? await prisma.question.count({ where: { canonicalCode: { not: null } } })
    : 0;

  // Duplicate candidates against the already existing site questions (never auto-merged).
  const exWords = existing.map((q) => ({ id: q.id, text: q.originalText, w: words(q.originalText) }));
  const dupRows: string[] = ["canonical_id;similarity;new_question;existing_question_id;existing_question"];
  for (const c of pkg.canonical_questions) {
    const w = words(c.question_de);
    let best = { s: 0, id: "", text: "" };
    for (const e of exWords) {
      const s = jaccard(w, e.w);
      if (s > best.s) best = { s, id: e.id, text: e.text };
    }
    if (best.s >= 0.3)
      dupRows.push([c.canonical_id, best.s.toFixed(2), c.question_de, best.id, best.text].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(";"));
  }

  const perStatus: Record<string, number> = {};
  for (const c of pkg.canonical_questions) perStatus[c.review_status] = (perStatus[c.review_status] ?? 0) + 1;
  console.log(
    JSON.stringify(
      {
        package: pkg.meta.counts,
        existingQuestionsInDb: existing.length,
        migrationApplied: migrated,
        phase1QuestionsAlreadyInDb: existingPhase1,
        reviewStatus: perStatus,
        duplicateCandidatesAgainstExisting: dupRows.length - 1,
        problems: problems.length,
      },
      null,
      1,
    ),
  );
  if (problems.length) {
    console.error("PROBLEMS:\n" + problems.join("\n"));
    process.exitCode = 1;
    return;
  }
  const report = arg("report");
  if (report) {
    mkdirSync(report, { recursive: true });
    writeFileSync(join(report, "duplicate_candidates_vs_existing.csv"), "﻿" + dupRows.join("\n"));
    console.log(`Report written to ${report}`);
  }
  if (!apply) {
    console.log("Dry run finished — nothing was written.");
    return;
  }

  // ---------- apply ----------
  const backup = arg("backup");
  if (!backup || !existsSync(backup)) throw new Error("--backup <existing content backup file> is required with --apply");
  if (!migrated) throw new Error("Migration 20261026100000_phase2_locations_protocols has not been applied to this database");
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", status: "APPROVED" }, orderBy: { createdAt: "asc" } });
  if (!admin) throw new Error("No approved ADMIN user found to own the imported rows");

  // Questions that an admin already approved/published are never overwritten by a re-import.
  const protectedRows = await prisma.question.findMany({
    where: { canonicalCode: { not: null }, status: { in: ["APPROVED", "PUBLISHED"] } },
    select: { id: true, canonicalCode: true },
  });
  const protectedIds = new Map(protectedRows.map((q) => [q.canonicalCode!, q.id]));
  if (protectedIds.size) console.log(`Skipping ${protectedIds.size} already approved/published imported question(s): ${[...protectedIds.keys()].join(", ")}`);

  const importedAt = new Date();
  await prisma.$transaction(
    async (tx) => {
      // locations
      const locIdByCode = new Map<string, string>();
      for (const [index, l] of pkg.locations.entries()) {
        const city = l.ort_document;
        const chamber = l.aerztekammer_document;
        const isUnknown = !city && !chamber;
        const name = isUnknown ? UNKNOWN_LOCATION : [city, chamber].filter(Boolean).join(" · ");
        const bundesland = l.bundesland_document ?? l.bundesland_derived;
        const data = {
          slug: slugify(name),
          name,
          city,
          chamber,
          bundesland,
          bundeslandDerived: !l.bundesland_document && !!l.bundesland_derived,
          isUnknown,
          order: index,
        };
        const row = await tx.examLocation.upsert({ where: { code: l.location_id }, update: data, create: { code: l.location_id, ...data } });
        locIdByCode.set(l.location_id, row.id);
      }
      // protocols
      const protIdByCode = new Map<string, string>();
      for (const p of pkg.protocols) {
        const data = {
          locationId: locIdByCode.get(p.location_id)!,
          year: p.year,
          dateText: p.date_text,
          examFormat: p.exam_format,
          isGermanOralExam: p.is_german_oral_exam,
          lowConfidence: p.low_confidence,
          sourcePages: p.source_pages,
        };
        const row = await tx.examProtocol.upsert({ where: { code: p.protocol_id }, update: data, create: { code: p.protocol_id, ...data } });
        protIdByCode.set(p.protocol_id, row.id);
      }
      // questions, answers, citations, specialties
      const corrByCq = new Map<string, Pkg["corrections"]>();
      for (const k of pkg.corrections) corrByCq.set(k.canonical_id, [...(corrByCq.get(k.canonical_id) ?? []), k]);
      const occByCq = new Map<string, Pkg["question_occurrences"]>();
      for (const o of pkg.question_occurrences) if (o.canonical_id) occByCq.set(o.canonical_id, [...(occByCq.get(o.canonical_id) ?? []), o]);

      const qIdByCode = new Map<string, string>();
      const specialtyLinks: { questionId: string; specialtyId: string }[] = [];
      for (const c of pkg.canonical_questions) {
        if (protectedIds.has(c.canonical_id)) {
          qIdByCode.set(c.canonical_id, protectedIds.get(c.canonical_id)!);
          continue;
        }
        const status = VERIFICATION[c.review_status];
        const contentStatus: ContentStatus = status === "TEXTBOOK_ONLY" || status === "MANUAL_REVIEW_REQUIRED" ? "DRAFT" : "IN_REVIEW";
        const refs = c.reference_ids.map((id) => refById.get(id)!);
        const unverifiedRefs = refs.filter((r) => !r.verified);
        const corrs = corrByCq.get(c.canonical_id) ?? [];
        const needsSpecialist = corrs.some((k) => k.needs_specialist_review);
        const notes = [
          `Prüfstatus: ${c.review_status}.`,
          needsSpecialist ? "Mindestens eine Korrektur erfordert fachärztliche Prüfung." : null,
          unverifiedRefs.length ? `Nicht verifizierte Quellen: ${unverifiedRefs.map((r) => r.ref_id).join(", ")}.` : null,
          !refs.length ? "Keine Quelle hinterlegt – manuell prüfen." : null,
          ...(c.evidence.manual ?? []).map((m) => `Manuell zu prüfen: ${m}`),
          c.editorial_notes ? `Redaktion: ${c.editorial_notes}` : null,
        ].filter(Boolean).join("\n");
        const occs = occByCq.get(c.canonical_id) ?? [];
        const data = {
          originalText: c.question_de,
          sourceType: "IMPORT" as const,
          sourceFile: "Prüfungsprotokolle Augenheilkunde (Phase-1-Auswertung)",
          pageReference: occs.map((o) => `${o.protocol_id} ${o.source_pages ?? ""}`.trim()).join("; ").slice(0, 1000) || null,
          importDate: importedAt,
          status: contentStatus,
          importKey: c.import_key,
          subcategory: subById.get(c.subcategory_id)!.name,
          verificationStatus: status,
          reviewNotes: notes,
          germanVsInternational: c.german_vs_international,
          controversies: c.controversies,
          protocolCount: c.frequency.distinct_protocols,
          reviewData: {
            secondaryTags: c.secondary_tags,
            evidence: c.evidence,
            corrections: corrs,
          },
        };
        const q = await tx.question.upsert({
          where: { canonicalCode: c.canonical_id },
          update: data,
          create: { canonicalCode: c.canonical_id, createdById: admin.id, ...data },
        });
        qIdByCode.set(c.canonical_id, q.id);

        specialtyLinks.push({
          questionId: q.id,
          specialtyId: specialtyIdByName.get(SPECIALTY_BY_LETTER[specLetter(c.specialty_id)])!,
        });

        // exactly one MODEL answer per imported question; replaced on re-import
        await tx.questionAnswer.deleteMany({ where: { questionId: q.id, type: "MODEL" } });
        await tx.questionAnswer.create({
          data: {
            questionId: q.id,
            type: "MODEL",
            text: c.answer.model_answer!,
            shortAnswer: c.answer.short_answer,
            keyPoints: c.answer.key_points ?? [],
            followUps: c.answer.follow_up_questions ?? [],
            citations: {
              create: refs.map((r, order) => ({
                type: citationType(r),
                title: r.title ?? r.ref_id,
                dateLabel: r.year_or_update,
                url: r.url,
                order,
                verified: r.verified,
                verificationNote: r.verification_note,
              })),
            },
          },
        });
      }
      // Bulk writes (few round trips). Re-runs replace the rows that carry Phase-1 codes / belong to imported questions.
      const importedQuestionIds = [...qIdByCode.values()].filter((id) => !new Set(protectedIds.values()).has(id));
      await tx.questionSpecialty.deleteMany({ where: { questionId: { in: importedQuestionIds } } });
      await tx.questionSpecialty.createMany({ data: specialtyLinks });

      // occurrences (all of them, including the ones without canonical question)
      await tx.questionOccurrence.deleteMany({ where: { code: { in: pkg.question_occurrences.map((o) => o.occurrence_id) } } });
      await tx.questionOccurrence.createMany({
        data: pkg.question_occurrences.map((o) => ({
          code: o.occurrence_id,
          questionId: o.canonical_id ? qIdByCode.get(o.canonical_id)! : null,
          protocolId: protIdByCode.get(o.protocol_id)!,
          originalText: o.original_question,
          correctedText: o.corrected_question,
          answerExcerpt: o.original_answer_excerpt,
          sourcePages: o.source_pages,
          flags: o.flags,
        })),
      });
      // question <-> location links
      const linkCount = new Map<string, number>();
      for (const o of pkg.question_occurrences) {
        if (!o.canonical_id) continue;
        const protLoc = protById.get(o.protocol_id)!.location_id;
        const key = `${o.canonical_id}|${protLoc}`;
        linkCount.set(key, (linkCount.get(key) ?? 0) + 1);
      }
      await tx.questionLocation.deleteMany({ where: { questionId: { in: importedQuestionIds } } });
      await tx.questionLocation.createMany({
        data: [...linkCount]
          .filter(([key]) => !protectedIds.has(key.split("|")[0]))
          .map(([key, count]) => {
            const [cq, loc] = key.split("|");
            return { questionId: qIdByCode.get(cq)!, locationId: locIdByCode.get(loc)!, occurrenceCount: count };
          }),
      });
      await tx.auditLog.create({
        data: {
          actorId: admin.id,
          entityType: "Phase1Import",
          entityId: "5_Website_Importpaket",
          action: "IMPORT",
          summary: `${pkg.canonical_questions.length} Fragen, ${pkg.question_occurrences.length} Vorkommen, ${pkg.protocols.length} Protokolle, ${pkg.locations.length} Orte (alle als DRAFT/IN_REVIEW)`,
        },
      });
    },
    { timeout: 540_000, maxWait: 30_000 },
  );
  console.log("Import applied. All imported questions are DRAFT or IN_REVIEW; nothing was published.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
