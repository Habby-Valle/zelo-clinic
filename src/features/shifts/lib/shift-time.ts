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

// Segunda-feira (00:00) da semana que contém `d`.
export function mondayOf(d: Date): Date {
  const x = new Date(d);
  const wd = (x.getDay() + 6) % 7; // 0=segunda … 6=domingo
  x.setDate(x.getDate() - wd);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

// Chave de agrupamento por dia local (YYYY-MM-DD), sem cair no UTC.
export function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
