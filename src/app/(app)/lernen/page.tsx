import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { InteractiveCard, CardTitle, CardDescription } from "@/components/ui/Card";
import { ArrowRight } from "lucide-react";

export default async function LernenPage() {
  const specialties = await prisma.specialty.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { questions: { where: { question: { status: "PUBLISHED" } } } } } },
  });
  const totalPublished = await prisma.question.count({ where: { status: "PUBLISHED" } });

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <div className="font-mono text-xs uppercase tracking-wider text-muted font-medium mb-1">
          Lernbereich
        </div>
        <h1 className="text-2xl font-normal tracking-tight text-foreground sm:text-3xl">Lernmodus</h1>
        <p className="mt-1 text-sm text-muted-secondary">
          Wählen Sie ein Fachgebiet oder lernen Sie fachgebietsübergreifend alle Fragen.
        </p>
      </div>

      <Link href="/lernen/sitzung">
        <InteractiveCard className="flex items-center justify-between border-foreground/20 bg-surface">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-accent font-medium">Umfassend</span>
            </div>
            <CardTitle className="text-lg mt-1">Alle Fachgebiete</CardTitle>
            <CardDescription>{totalPublished} veröffentlichte Fragen im Gesamtkatalog</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <span>Sitzung starten</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </InteractiveCard>
      </Link>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {specialties.map((s, i) => (
          <Link key={s.id} href={`/lernen/sitzung?specialty=${s.id}`}>
            <InteractiveCard
              className="h-full animate-fade-in-up flex flex-col justify-between"
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
            >
              <div>
                <CardTitle className="text-sm font-medium">{s.name}</CardTitle>
                <CardDescription className="font-mono text-xs">{s._count.questions} Fragen</CardDescription>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted pt-2 border-t border-border/50">
                <span>Üben</span>
                <ArrowRight className="h-3 w-3 opacity-60" />
              </div>
            </InteractiveCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
