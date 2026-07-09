// Parser de exibição para o texto de medicações declarado pela família no app.
// O app serializa cada item como "Nome (dose) - Turno1, Turno2", itens
// separados por ";" ou quebra de linha (ver memória project_health_intake_structured).
// Tolerante a dados legados (texto livre): quando não há estrutura, cai para
// apenas o nome com a linha bruta. NÃO divide no nível superior por vírgula,
// pois os turnos são separados por vírgula dentro do item.

export interface DeclaredMedicationDetail {
  name: string;
  dose?: string;
  turns: string[];
  raw: string;
}

export function parseDeclaredMedicationDetails(text: string): DeclaredMedicationDetail[] {
  if (!text?.trim()) return [];

  return text
    .split(/[\n;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((raw) => {
      let rest = raw;

      // dose entre parênteses: "(50mg)"
      let dose: string | undefined;
      const doseMatch = rest.match(/\(([^)]*)\)/);
      if (doseMatch) {
        dose = doseMatch[1].trim() || undefined;
        rest = rest.replace(doseMatch[0], " ").trim();
      }

      // turnos após " - " (ou travessão): "Manhã, Noite"
      let turns: string[] = [];
      const turnSplit = rest.split(/\s[-–]\s/);
      if (turnSplit.length > 1) {
        rest = turnSplit[0].trim();
        turns = turnSplit
          .slice(1)
          .join(" - ")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }

      const name = rest.replace(/\s{2,}/g, " ").trim();
      return { name: name || raw, dose, turns, raw };
    })
    .filter((m) => m.name.length > 0);
}
