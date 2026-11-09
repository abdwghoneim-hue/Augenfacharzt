import "server-only";
import { prisma } from "@/lib/prisma";

export async function getHomeStats(userId: string) {
  const totalPublished = await prisma.question.count({ where: { status: "PUBLISHED" } });
  const reviewed = await prisma.userProgress.count({
    where: { userId, confidence: { not: null }, question: { status: "PUBLISHED" } },
  });
  const dueCount = await prisma.userProgress.count({
    where: { userId, nextReviewAt: { lte: new Date() }, question: { status: "PUBLISHED" } },
  });
  const weakSpecialties = await prisma.userProgress.groupBy({
    by: ["questionId"],
    where: { userId, confidence: "NICHT_GEWUSST", question: { status: "PUBLISHED" } },
  });

  const weakQuestionIds = weakSpecialties.map((row) => row.questionId);
  let weakTopics: { name: string; count: number }[] = [];
  if (weakQuestionIds.length > 0) {
    const links = await prisma.questionSpecialty.findMany({
      where: { questionId: { in: weakQuestionIds } },
      include: { specialty: true },
    });
    const counts = new Map<string, number>();
    for (const link of links) {
      counts.set(link.specialty.name, (counts.get(link.specialty.name) ?? 0) + 1);
    }
    weakTopics = [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  return {
    totalPublished,
    reviewed,
    remaining: Math.max(totalPublished - reviewed, 0),
    dueCount,
    weakTopics,
  };
}

export type SpecialtyOverview = {
  id: string;
  slug: string;
  name: string;
  total: number;
  reviewed: number;
  percent: number;
};

export async function getSpecialtyOverview(userId: string): Promise<SpecialtyOverview[]> {
  const specialties = await prisma.specialty.findMany({ orderBy: { order: "asc" } });

  const rows: SpecialtyOverview[] = [];
  for (const s of specialties) {
    const total = await prisma.question.count({
      where: { status: "PUBLISHED", specialties: { some: { specialtyId: s.id } } },
    });
    const reviewed = await prisma.userProgress.count({
      where: {
        userId,
        confidence: { not: null },
        question: { status: "PUBLISHED", specialties: { some: { specialtyId: s.id } } },
      },
    });
    rows.push({
      id: s.id,
      slug: s.slug,
      name: s.name,
      total,
      reviewed,
      percent: total > 0 ? Math.round((reviewed / total) * 100) : 0,
    });
  }

  return rows;
}

export type RecentActivityItem = {
  questionId: string;
  questionText: string;
  confidence: string | null;
  lastReviewedAt: Date;
  specialtyNames: string[];
};

export async function getRecentActivity(userId: string, limit = 5): Promise<RecentActivityItem[]> {
  const rows = await prisma.userProgress.findMany({
    where: { userId, lastReviewedAt: { not: null } },
    orderBy: { lastReviewedAt: "desc" },
    take: limit,
    include: {
      question: { include: { specialties: { include: { specialty: true } } } },
    },
  });

  return rows.map((r) => ({
    questionId: r.questionId,
    questionText: r.question.originalText,
    confidence: r.confidence,
    lastReviewedAt: r.lastReviewedAt!,
    specialtyNames: r.question.specialties.map((s) => s.specialty.name),
  }));
}
