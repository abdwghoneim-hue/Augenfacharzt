// Read-only export of all content tables (no password hashes, sessions or reset tokens)
// to a JSON file. Run BEFORE any import:
//   npx tsx prisma/phase1/backup-content.ts <output.json>
import "dotenv/config";
import { writeFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const out = process.argv[2];
  if (!out) throw new Error("Usage: tsx prisma/phase1/backup-content.ts <output.json>");
  const dump = {
    exportedAt: new Date().toISOString(),
    host: new URL(process.env.DATABASE_URL!).host,
    specialties: await prisma.specialty.findMany(),
    questions: await prisma.question.findMany(),
    questionSpecialties: await prisma.questionSpecialty.findMany(),
    answers: await prisma.questionAnswer.findMany(),
    citations: await prisma.answerCitation.findMany(),
    clinicalCases: await prisma.clinicalCase.findMany(),
    followUps: await prisma.followUpQuestion.findMany(),
    images: await prisma.questionImage.findMany(),
    importBatches: await prisma.importBatch.findMany(),
    userProgress: await prisma.userProgress.findMany(),
    examSessions: await prisma.examSession.findMany(),
    examAnswers: await prisma.examAnswer.findMany(),
    users: (await prisma.user.findMany()).map(({ passwordHash: _p, ...u }) => u),
  };
  writeFileSync(out, JSON.stringify(dump, null, 1));
  console.log(
    Object.entries(dump)
      .filter(([, v]) => Array.isArray(v))
      .map(([k, v]) => `${k}=${(v as unknown[]).length}`)
      .join(" "),
  );
}
main().finally(() => prisma.$disconnect());
