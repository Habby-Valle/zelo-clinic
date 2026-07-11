"use client";

import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientShiftsRange } from "../hooks/use-shifts";
import type { ShiftItem } from "../types";
import { mondayOf, addDays, localDateKey } from "../lib/shift-time";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { "pt-BR": ptBR },
});

const STATUS_COLOR: Record<ShiftItem["status"], string> = {
  scheduled: "#64748b", // slate
  in_progress: "#2563eb", // blue
  completed: "#16a34a", // green
  cancelled: "#dc2626", // red
};

interface ShiftEvent extends Event {
  status: ShiftItem["status"];
}

// Lacuna = dia sem turno cujo MESMO dia da semana é coberto antes e depois
// (evita marcar folgas de fim de semana num esquema seg–sex).
function computeGapDays(shifts: ShiftItem[], gridStart: Date): Set<string> {
  const covered = new Set(shifts.map((s) => localDateKey(new Date(s.start))));
  const byWeekday: Record<number, string[]> = {};
  for (const key of covered) {
    const wd = new Date(`${key}T00:00`).getDay();
    (byWeekday[wd] ??= []).push(key);
  }
  const gaps = new Set<string>();
  for (let i = 0; i < 42; i++) {
    const day = addDays(gridStart, i);
    const key = localDateKey(day);
    if (covered.has(key)) continue;
    const list = byWeekday[day.getDay()] ?? [];
    if (list.some((k) => k < key) && list.some((k) => k > key)) gaps.add(key);
  }
  return gaps;
}

export function ShiftCalendar({ patientId }: { patientId: string }) {
  const [date, setDate] = useState(() => new Date());

  const monthAnchor = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = mondayOf(monthAnchor);

  const { data, isLoading } = usePatientShiftsRange(
    patientId,
    localDateKey(gridStart),
    localDateKey(addDays(gridStart, 41))
  );

  const shifts = useMemo(() => data?.shifts ?? [], [data]);

  const events = useMemo<ShiftEvent[]>(
    () =>
      shifts.map((s) => ({
        title: `${new Date(s.start).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })} ${s.caregiver_name}`,
        start: new Date(s.start),
        end: new Date(s.end),
        status: s.status,
      })),
    [shifts]
  );

  const gapDays = useMemo(() => computeGapDays(shifts, gridStart), [shifts, gridStart]);

  return (
    <div className="space-y-2">
      {isLoading ? (
        <Skeleton className="h-[600px] w-full" />
      ) : (
        <div style={{ height: 600 }}>
          <Calendar
            localizer={localizer}
            culture="pt-BR"
            events={events}
            date={date}
            onNavigate={(d) => setDate(d)}
            views={["month", "week", "day", "agenda"]}
            defaultView="month"
            popup
            eventPropGetter={(event) => {
              const e = event as ShiftEvent;
              const bg = STATUS_COLOR[e.status];
              return {
                style: {
                  backgroundColor: bg,
                  border: "none",
                  borderRadius: 4,
                  opacity: e.status === "cancelled" ? 0.6 : 1,
                  textDecoration: e.status === "cancelled" ? "line-through" : "none",
                  fontSize: 11,
                },
              };
            }}
            dayPropGetter={(d) => {
              if (gapDays.has(localDateKey(d))) {
                return {
                  style: {
                    backgroundColor: "rgba(245, 158, 11, 0.12)", // amber tint
                  },
                  className: "rbc-gap-day",
                };
              }
              return {};
            }}
            messages={{
              today: "Hoje",
              previous: "‹",
              next: "›",
              month: "Mês",
              week: "Semana",
              day: "Dia",
              agenda: "Agenda",
              date: "Data",
              time: "Hora",
              event: "Turno",
              noEventsInRange: "Sem turnos neste período.",
              showMore: (n: number) => `+${n} mais`,
            }}
          />
        </div>
      )}
      {gapDays.size > 0 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block h-3 w-3 rounded-sm bg-amber-500/20" />
          Dias em âmbar: sem cobertura (turno esperado nesse dia da semana, mas nenhum
          agendado — possível conflito de escala).
        </p>
      )}
    </div>
  );
}
