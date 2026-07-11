"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface SkippedShiftInfo {
  created: number;
  skipped: { date: string; reason: string }[];
}

function formatDay(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function SkippedShiftsDialog({
  info,
  onClose,
}: {
  info: SkippedShiftInfo | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={info !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {info?.created ?? 0} turno(s) criado(s)
          </DialogTitle>
          <DialogDescription>
            Alguns dias não foram agendados porque gerariam conflito.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            {info?.skipped.length ?? 0} dia(s) pulado(s)
          </p>
          <ul className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-2 text-sm">
            {(info?.skipped ?? []).map((s) => (
              <li key={s.date} className="flex justify-between gap-3">
                <span className="font-medium">{formatDay(s.date)}</span>
                <span className="text-right text-muted-foreground">{s.reason}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Ajuste o horário, troque o cuidador ou agende esses dias manualmente.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Entendi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
