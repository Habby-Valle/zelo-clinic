export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Combina data (YYYY-MM-DD) + hora (HH:MM) em ISO; se o fim for <= início,
// entende como turno que vira o dia (fim no dia seguinte).
export function shiftDateTimes(date: string, startTime: string, endTime: string) {
  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);
  if (end <= start) end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

// Data de início do turno a partir do início do contrato: usa a data do
// contrato, mas nunca no passado (cai para hoje).
export function shiftStartFromContract(contractStartDate: string | null): string {
  const t = todayISO();
  if (!contractStartDate) return t;
  return contractStartDate < t ? t : contractStartDate;
}

export const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
