import type { ShiftItem } from "../types";

/**
 * Chave de badge de um turno. Turno cancelado automaticamente pelo sistema
 * (auto_cancelled = falta / não realizado) recebe um badge próprio, distinto
 * do "Cancelado" manual e do "Concluído".
 */
export type ShiftBadgeKey = ShiftItem["status"] | "not_performed";

export function shiftBadgeKey(
  status: ShiftItem["status"],
  autoCancelled?: boolean,
): ShiftBadgeKey {
  return status === "cancelled" && autoCancelled ? "not_performed" : status;
}

export const SHIFT_BADGE_LABELS: Record<ShiftBadgeKey, string> = {
  scheduled: "Agendado",
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
  not_performed: "Não realizado",
};
