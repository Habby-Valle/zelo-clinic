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
  times: string[];
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

      // Segmentos após " - " (ou travessão): turnos e/ou horários.
      // Classificação por conteúdo: segmento com dígito é horário (ex: "08:00"),
      // caso contrário é turno (ex: "Manhã") — assim a ordem/ausência não confunde.
      const segments = rest
        .split(/\s[-–]\s/)
        .map((s) => s.trim())
        .filter(Boolean);
      const name = (segments.shift() ?? rest).replace(/\s{2,}/g, " ").trim();

      const turns: string[] = [];
      const times: string[] = [];
      for (const seg of segments) {
        const values = seg
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
        if (/\d/.test(seg)) times.push(...values);
        else turns.push(...values);
      }

      return { name: name || raw, dose, turns, times, raw };
    })
    .filter((m) => m.name.length > 0);
}
