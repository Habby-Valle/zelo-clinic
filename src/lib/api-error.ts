/**
 * Extrai a mensagem mais útil de um corpo de erro da API (DRF).
 *
 * Ordem de prioridade: `non_field_errors[]`, `detail`, `error`, `message` e,
 * por fim, erros de campo (`{ campo: ["msg"] | "msg" }`). Evita cair em
 * "Erro desconhecido" quando o backend devolve erros por campo.
 */
export function extractApiErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "Erro desconhecido";

  const record = body as Record<string, unknown>;

  const asString = (value: unknown): string | null =>
    typeof value === "string"
      ? value
      : Array.isArray(value) && typeof value[0] === "string"
        ? value[0]
        : null;

  const general =
    asString(record.non_field_errors) ??
    asString(record.detail) ??
    asString(record.error) ??
    asString(record.message);
  if (general) return general;

  const messages: string[] = [];
  for (const [key, value] of Object.entries(record)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") messages.push(formatFieldMessage(key, item));
      }
    } else if (typeof value === "string" && value.trim()) {
      messages.push(formatFieldMessage(key, value));
    }
  }

  return messages.length ? messages.join(" · ") : "Erro desconhecido";
}

function formatFieldMessage(field: string, message: string): string {
  const label = field.replace(/_/g, " ");
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
  return `${capitalized}: ${message}`;
}
