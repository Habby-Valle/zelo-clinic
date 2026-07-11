import { redirect } from "next/navigation";
import { requireClinicUser } from "@/lib/auth";
import { CarePlansEntryClient } from "@/features/care-plans/components/care-plans-entry-client";

export default async function CarePlansPage() {
  const { user } = await requireClinicUser();
  // Revisão/aprovação é do enfermeiro (separação de funções).
  if (user.role !== "clinic_nurse" && user.role !== "super_admin") {
    redirect("/dashboard");
  }
  // Havendo plano pendente, o enfermeiro cai direto na curadoria; senão, listagem.
  return <CarePlansEntryClient />;
}
