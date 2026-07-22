"use client";

import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTour: () => void;
}

export function WelcomeDialog({ open, onOpenChange, onStartTour }: WelcomeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Bem-vindo ao Zelo!</DialogTitle>
          <DialogDescription className="text-center">
            Vamos conhecer o painel da sua clínica? Este tour rápido mostra cada seção e suas
            funcionalidades.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={onStartTour} className="w-full">
            Iniciar Tour
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            Pular
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
