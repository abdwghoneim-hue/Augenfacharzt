"use client";

import { useActionState, useState } from "react";
import { saveClinicalCaseAction, type ActionState } from "@/app/actions/questions";
import { Button } from "@/components/ui/Button";
import { Textarea, Label, FieldGroup } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Alert";

export function ClinicalCaseForm({
  questionId,
  scenarioText,
  followUps,
}: {
  questionId: string;
  scenarioText?: string;
  followUps?: string[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveClinicalCaseAction,
    null,
  );
  const [items, setItems] = useState<string[]>(
    followUps && followUps.length > 0 ? followUps : [""],
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="questionId" value={questionId} />
      {state?.error && <Alert tone="danger">{state.error}</Alert>}
      {state?.success && <Alert tone="success">{state.success}</Alert>}
      <FieldGroup>
        <Label>Erweitertes klinisches Fallszenario</Label>
        <Textarea
          name="scenarioText"
          rows={4}
          defaultValue={scenarioText}
          placeholder="z. B. Ein 74-jähriger Patient stellt sich mit …"
        />
      </FieldGroup>
      <FieldGroup>
        <Label>Prüfer-Nachfragen (2–5)</Label>
        <div className="space-y-2">
          {items.map((value, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                name="followUps"
                defaultValue={value}
                className="w-full rounded-[var(--radius-button)] border border-border bg-surface-recessed px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground"
                placeholder={`Nachfrage ${index + 1}`}
              />
              {items.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
        </div>
        {items.length < 5 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setItems([...items, ""])}
          >
            + Nachfrage hinzufügen
          </Button>
        )}
      </FieldGroup>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Wird gespeichert …" : "Fall speichern"}
      </Button>
    </form>
  );
}
