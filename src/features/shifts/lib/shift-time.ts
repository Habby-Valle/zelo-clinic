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

// Último dia do mês da data informada (YYYY-MM-DD). Usado como padrão de
// "Repetir até" quando o turno recorrente é pré-preenchido pela declaração.
export function endOfMonthISO(dateISO: string): string {
  const [y, m] = dateISO.split("-").map(Number);
  if (!y || !m) return dateISO;
  const d = new Date(y, m, 0); // dia 0 do mês seguinte = último dia deste mês
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Rótulo legível de duração em horas: 5.72 → "5h43", 6 → "6h".
export function formatDurationLabel(hours: number): string {
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

// Soma `hours` (pode ter fração) a um horário "HH:MM", ao minuto exato,
// dando a volta em 24h. Ex.: addHoursToTime("08:00", 5.72) → "13:43".
export function addHoursToTime(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const total = h * 60 + m + Math.round(hours * 60);
  const wrapped = ((total % 1440) + 1440) % 1440;
  const hh = Math.floor(wrapped / 60);
  const mm = wrapped % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

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
