"use client";

import { useState } from "react";
import { Loader2, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { inviteNurseApi } from "@/features/caregivers/services/caregivers.service";

export function NurseInviteButton() {
  const clinicId = useAuthStore((state) => state.user?.clinic_id ?? null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleInvite() {
    if (!email.trim()) return;
    if (!clinicId) {
      toast.error("Clínica não identificada. Faça login novamente.");
      return;
    }
    setLoading(true);
    try {
      await inviteNurseApi(email.trim(), clinicId);
      toast.success(`Convite enviado para ${email.trim()}.`);
      setEmail("");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar convite.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setEmail("");
          setOpen(true);
        }}
      >
        <Stethoscope className="mr-2 h-4 w-4" />
        Convidar Enfermeiro(a)
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Enfermeiro(a)</DialogTitle>
            <DialogDescription>
              Enviaremos um e-mail com o link de cadastro. O enfermeiro poderá acessar os planos de
              cuidado da clínica.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="nurse-email">Email do enfermeiro(a)</Label>
            <Input
              id="nurse-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="enfermeiro@email.com"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInvite} disabled={loading || !email.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
