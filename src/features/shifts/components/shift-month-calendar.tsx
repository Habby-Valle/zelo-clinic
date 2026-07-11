"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePatientShiftsRange } from "../hooks/use-shifts";
import type { ShiftItem } from "../types";
import { WEEKDAY_LABELS, mondayOf, addDays, localDateKey } from "../lib/shift-time";

const STATUS_ACCENT: Record<ShiftItem["status"], string> = {
  scheduled: "border-l-muted-foreground/40 bg-muted",
  in_progress: "border-l-primary bg-primary/10",
  completed: "border-l-green-500 bg-green-500/10",
  cancelled: "border-l-destructive bg-destructive/10 line-through opacity-70",
};

function hhmm(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ShiftMonthCalendar({ patientId }: { patientId: string }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Grade de 6 semanas começando na segunda que contém o dia 1º.
  const gridStart = useMemo(() => mondayOf(month), [month]);
  const days = useMemo(
    () => Array.from({ length: 42 }, (_, i) => addDays(gridStart, i)),
    [gridStart]
  );

  const { data, isLoading } = usePatientShiftsRange(
    patientId,
    localDateKey(gridStart),
    localDateKey(addDays(gridStart, 41))
  );

  const byDay = useMemo(() => {
    const map: Record<string, ShiftItem[]> = {};
    for (const s of data?.shifts ?? []) {
      const key = localDateKey(new Date(s.start));
      (map[key] ??= []).push(s);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.start.localeCompare(b.start));
    }
    return map;
  }, [data]);

  const todayKey = localDateKey(new Date());
  const monthLabel = month.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Mês anterior"
            onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[150px] text-center text-sm font-medium capitalize">
            {monthLabel}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Próximo mês"
            onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const d = new Date();
            setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
          }}
        >
          Hoje
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {WEEKDAY_LABELS.map((d) => (
              <div
                key={d}
                className="py-1.5 text-center text-xs font-medium text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = localDateKey(day);
              const inMonth = day.getMonth() === month.getMonth();
              const isToday = key === todayKey;
              const dayShifts = byDay[key] ?? [];
              return (
                <div
                  key={key}
                  className={cn(
                    "min-h-[84px] border-b border-r p-1 last:border-r-0 [&:nth-child(7n)]:border-r-0",
                    !inMonth && "bg-muted/30"
                  )}
                >
                  <div
                    className={cn(
                      "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs",
                      isToday && "bg-primary font-medium text-primary-foreground",
                      !inMonth && !isToday && "text-muted-foreground/50"
                    )}
                  >
                    {day.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayShifts.slice(0, 3).map((s) => (
                      <div
                        key={s.id}
                        className={cn(
                          "truncate rounded border-l-2 px-1 py-0.5 text-[10px] leading-tight",
                          STATUS_ACCENT[s.status]
                        )}
                        title={`${hhmm(s.start)}–${hhmm(s.end)} · ${s.caregiver_name}`}
                      >
                        {hhmm(s.start)} {s.caregiver_name}
                      </div>
                    ))}
                    {dayShifts.length > 3 && (
                      <div className="px-1 text-[10px] text-muted-foreground">
                        +{dayShifts.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
