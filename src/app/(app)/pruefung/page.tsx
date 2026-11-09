import { prisma } from "@/lib/prisma";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { startExamSessionAction } from "@/app/actions/exam";

export default async function PruefungPage() {
  const specialties = await prisma.specialty.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <div className="font-mono text-xs uppercase tracking-wider text-muted font-medium mb-1">
          Simulation
        </div>
        <h1 className="text-2xl font-normal tracking-tight text-foreground sm:text-3xl">Prüfungssimulation</h1>
        <p className="mt-1 text-sm text-muted-secondary">
          Strukturierter Ablauf wie in der mündlichen Prüfung: Fall lesen, Antwort verfassen,
          Nachfragen, Musterantwort und Selbsteinschätzung.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardTitle>Nach Fachgebiet</CardTitle>
          <CardDescription>Gezielte Prüfungssimulation für ein einzelnes ophthalmologisches Fachgebiet.</CardDescription>
          <form action={startExamSessionAction} className="mt-4 flex flex-wrap items-center gap-3">
            <input type="hidden" name="mode" value="SPECIALTY" />
            <Select name="specialtyId" required className="w-72">
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="primary">Prüfung beginnen</Button>
          </form>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="flex flex-col justify-between">
            <div>
              <CardTitle>Gemischte Prüfung</CardTitle>
              <CardDescription>Zufällige Zusammenstellung relevanter Fälle über alle Fachgebiete hinweg.</CardDescription>
            </div>
            <form action={startExamSessionAction} className="mt-6">
              <input type="hidden" name="mode" value="MIXED" />
              <Button type="submit" variant="secondary" className="w-full">Gemischte Prüfung starten</Button>
            </form>
          </Card>

          <Card className="flex flex-col justify-between">
            <div>
              <CardTitle>Bildgestützte Prüfung</CardTitle>
              <CardDescription>Fokus auf klinische Bildgebung (Fundus, OCT, Spaltlampe, Angiographie).</CardDescription>
            </div>
            <form action={startExamSessionAction} className="mt-6">
              <input type="hidden" name="mode" value="IMAGE" />
              <Button type="submit" variant="secondary" className="w-full">Bildprüfung starten</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
