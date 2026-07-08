import type { MedicationSuggestion } from "../types";

// Fallback heurístico local: extrai apenas os NOMES dos medicamentos do texto
// livre declarado pela família, usado quando a extração por IA não está
// disponível. Não infere dose, via nem horários — esses campos são clínicos e
// devem vir da receita médica, preenchidos manualmente pelo enfermeiro.

const DOSE_RE = /\s*\d+(?:[.,]\d+)?\s?(?:mg|ml|g|mcg|ui|gotas?|comp\.?|cp)\b.*$/i;

export function parseDeclaredMedications(text: string): MedicationSuggestion[] {
  if (!text?.trim()) return [];

  return text
    .split(/[\n;/•·]+/) // uma medicação por linha/separador
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Nome = trecho antes da dose/posologia; o resto vira referência.
      const name = line
        .replace(DOSE_RE, "")
        .split(/\s{2,}|,|-/)[0]
        .trim();
      return { name, source_text: line };
    })
    .filter((m) => m.name.length > 1);
}
