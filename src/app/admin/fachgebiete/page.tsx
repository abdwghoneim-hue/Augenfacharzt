import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CreateSpecialtyForm } from "@/components/admin/CreateSpecialtyForm";
import { renameSpecialtyAction, deleteSpecialtyAction } from "@/app/actions/specialties";

export default async function SpecialtiesAdminPage() {
  const specialties = await prisma.specialty.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { questions: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-xs uppercase tracking-wider text-muted font-medium mb-1">
          Taxonomie
        </div>
        <h1 className="text-2xl font-normal tracking-tight text-foreground sm:text-3xl">Fachgebiete</h1>
        <p className="mt-1 text-sm text-muted-secondary">
          Die Fachgebiete dienen zur Kategorisierung der Prüfungsfragen. Jede Frage kann mehreren
          Fachgebieten zugeordnet werden.
        </p>
      </div>

      <Card>
        <CardTitle>Neues Fachgebiet anlegen</CardTitle>
        <CardDescription>Ergänzen Sie ein neues medizinisches Teilgebiet.</CardDescription>
        <div className="mt-4">
          <CreateSpecialtyForm />
        </div>
      </Card>

      <Card>
        <CardTitle>Vorhandene Fachgebiete ({specialties.length})</CardTitle>
        <CardDescription>Reihenfolge und Bezeichnungen anpassen.</CardDescription>
        <ul className="mt-4 divide-y divide-border/60">
          {specialties.map((specialty) => (
            <li key={specialty.id} className="flex flex-wrap items-center gap-3 py-3">
              <form action={renameSpecialtyAction} className="flex flex-1 items-center gap-2">
                <input type="hidden" name="id" value={specialty.id} />
                <Input name="name" defaultValue={specialty.name} className="max-w-sm py-1.5 text-sm" />
                <Button type="submit" variant="secondary" size="sm">
                  Speichern
                </Button>
              </form>
              <span className="font-mono text-xs text-muted">{specialty._count.questions} Fragen</span>
              <form action={deleteSpecialtyAction}>
                <input type="hidden" name="id" value={specialty.id} />
                <Button type="submit" variant="ghost" size="sm" className="text-danger hover:bg-danger-soft/60">
                  Entfernen
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
