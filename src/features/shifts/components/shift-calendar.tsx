"use client";

import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, type Event, type View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useShiftsRange } from "../hooks/use-shifts";
import type { ShiftItem } from "../types";
import { mondayOf, addDays, localDateKey } from "../lib/shift-time";

const STATUS_LABEL: Record<ShiftItem["status"], string> = {
  scheduled: "Agendado",
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const STATUS_BADGE: Record<ShiftItem["status"], "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "outline",
  in_progress: "default",
  completed: "secondary",
  cancelled: "destructive",
};

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
  shift: ShiftItem;
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

interface ShiftCalendarProps {
  /** Visão de um paciente (habilita marcação de lacunas). */
  patientId?: string;
  /** Filtro de status (visão da clínica). */
  status?: string;
  /** Marca dias sem cobertura (só faz sentido por paciente). */
  showGaps?: boolean;
  /** Inclui o nome do paciente no evento (visão da clínica). */
  showPatient?: boolean;
}

export function ShiftCalendar({
  patientId,
  status,
  showGaps = false,
  showPatient = false,
}: ShiftCalendarProps) {
  const [date, setDate] = useState(() => new Date());
  const [view, setView] = useState<View>("month");

  const monthAnchor = new Date(date.getFullYear(), date.getMonth(), 1);
  const gridStart = mondayOf(monthAnchor);

  const { data, isLoading } = useShiftsRange(
    localDateKey(gridStart),
    localDateKey(addDays(gridStart, 41)),
    { patient_id: patientId, status: status || undefined }
  );

  const shifts = useMemo(() => data?.shifts ?? [], [data]);

  const events = useMemo<ShiftEvent[]>(
    () =>
      shifts.map((s) => ({
        title:
          `${new Date(s.start).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })} ${s.caregiver_name}` +
          (showPatient && s.shift_patients.length
            ? ` · ${s.shift_patients.map((p) => p.patient_name).join(", ")}`
            : ""),
        start: new Date(s.start),
        end: new Date(s.end),
        status: s.status,
        shift: s,
      })),
    [shifts, showPatient]
  );

  const gapDays = useMemo(
    () => (showGaps ? computeGapDays(shifts, gridStart) : new Set<string>()),
    [shifts, gridStart, showGaps]
  );
  const [selected, setSelected] = useState<ShiftItem | null>(null);

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
            view={view}
            onView={(v) => setView(v)}
            views={["month", "week", "day", "agenda"]}
            onSelectEvent={(e) => setSelected((e as ShiftEvent).shift)}
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

      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Turno
              {selected && (
                <Badge variant={STATUS_BADGE[selected.status]}>
                  {STATUS_LABEL[selected.status]}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              {showPatient && (
                <div>
                  <span className="font-medium">Paciente:</span>{" "}
                  {selected.shift_patients.map((p) => p.patient_name).join(", ")}
                </div>
              )}
              <div>
                <span className="font-medium">Cuidador:</span> {selected.caregiver_name}
              </div>
              <div>
                <span className="font-medium">Data:</span>{" "}
                {new Date(selected.start).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div>
                <span className="font-medium">Horário:</span>{" "}
                {new Date(selected.start).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" – "}
                {new Date(selected.end).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          )}
          <DialogFooter>
            {selected && (
              <Link href={`/shifts/${selected.id}`}>
                <Button variant="outline">Abrir turno</Button>
              </Link>
            )}
            <Button onClick={() => setSelected(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
