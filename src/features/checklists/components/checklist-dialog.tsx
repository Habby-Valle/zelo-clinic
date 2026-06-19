"use client";

import { ClipboardList } from "lucide-react";
import type { ChecklistDetail } from "@/features/checklists/types";
import { ChecklistForm } from "./checklist-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklist?: ChecklistDetail;
}

export function ChecklistDialog({ open, onOpenChange, checklist }: ChecklistDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {checklist ? "Editar Checklist" : "Novo Checklist"}
          </DialogTitle>
        </DialogHeader>

        <ChecklistForm checklist={checklist} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
