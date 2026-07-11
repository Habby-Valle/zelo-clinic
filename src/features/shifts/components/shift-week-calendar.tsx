"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ShiftItem } from "../types";
import { WEEKDAY_LABELS, mondayOf, addDays, localDateKey } from "../lib/shift-time";

const STATUS_ACCENT: Record<ShiftItem["status"], string> = {
  scheduled: "border-l-muted-foreground/40 bg-muted/40",
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

interface Props {
  shifts: ShiftItem[];
  /** Mostra o nome do cuidador no chip (útil quando há vários por dia). */
  showCaregiver?: boolean;
}

export function ShiftWeekCalendar({ shifts, showCaregiver = true }: Props) {
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const byDay = useMemo(() => {
    const map: Record<string, ShiftItem[]> = {};
    for (const s of shifts) {
      const key = localDateKey(new Date(s.start));
      (map[key] ??= []).push(s);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.start.localeCompare(b.start));
    }
    return map;
  }, [shifts]);

  const todayKey = localDateKey(new Date());
  const rangeLabel = `${weekStart.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })} – ${addDays(weekStart, 6).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  })}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Semana anterior"
            onClick={() => setWeekStart((w) => addDays(w, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center text-sm font-medium capitalize">
            {rangeLabel}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            aria-label="Próxima semana"
            onClick={() => setWeekStart((w) => addDays(w, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setWeekStart(mondayOf(new Date()))}
        >
          Hoje
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 overflow-x-auto">
        {days.map((day, i) => {
          const key = localDateKey(day);
          const dayShifts = byDay[key] ?? [];
          const isToday = key === todayKey;
          return (
            <div key={key} className="min-w-[92px] space-y-1">
              <div
                className={cn(
                  "rounded-md py-1 text-center text-xs",
                  isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                <div className="font-medium">{WEEKDAY_LABELS[i]}</div>
                <div className="text-[11px]">{day.getDate()}</div>
              </div>
              <div className="space-y-1">
                {dayShifts.length === 0 ? (
                  <div className="py-2 text-center text-xs text-muted-foreground/40">·</div>
                ) : (
                  dayShifts.map((s) => (
                    <div
                      key={s.id}
                      className={cn(
                        "rounded border-l-2 px-1.5 py-1 text-[11px] leading-tight",
                        STATUS_ACCENT[s.status]
                      )}
                      title={showCaregiver ? s.caregiver_name : undefined}
                    >
                      <div className="font-medium">
                        {hhmm(s.start)}–{hhmm(s.end)}
                      </div>
                      {showCaregiver && (
                        <div className="truncate text-muted-foreground">
                          {s.caregiver_name}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
