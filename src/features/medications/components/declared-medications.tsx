import { Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { parseDeclaredMedicationDetails } from "../lib/parse-declared-detail";

interface DeclaredMedicationsProps {
  text: string | null | undefined;
}

export function DeclaredMedications({ text }: DeclaredMedicationsProps) {
  const items = parseDeclaredMedicationDetails(text ?? "");

  if (items.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <ul className="mt-1 space-y-1.5">
      {items.map((med, i) => (
        <li key={`${med.name}-${i}`} className="flex items-start gap-2">
          <Pill className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium">{med.name}</span>
            {med.dose && <span className="text-muted-foreground">{med.dose}</span>}
            {med.turns.map((turn) => (
              <Badge key={turn} variant="secondary" className="font-normal">
                {turn}
              </Badge>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
