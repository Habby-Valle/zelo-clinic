import { redirect } from "next/navigation";
import { requireClinicUser } from "@/lib/auth";
import { CarePlansEntryClient } from "@/features/care-plans/components/care-plans-entry-client";

export default async function CarePlansPage() {
  const { user } = await requireClinicUser();
  // O plano de cuidado é gerido pelo admin da clínica, que monta e ativa o
  // plano (o fluxo de aprovação do enfermeiro foi removido).
  if (user.role !== "clinic_admin" && user.role !== "clinic_nurse" && user.role !== "super_admin") {
    redirect("/dashboard");
  }
  // Havendo plano pendente de ativação, cai direto na curadoria; senão, listagem.
  return <CarePlansEntryClient />;
}
