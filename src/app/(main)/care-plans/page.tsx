import { redirect } from "next/navigation";
import { requireClinicUser } from "@/lib/auth";
import { CarePlansListClient } from "@/features/care-plans/components/care-plans-list-client";

export default async function CarePlansPage() {
  const { user } = await requireClinicUser();
  // Revisão/aprovação é do enfermeiro (separação de funções).
  if (user.role !== "clinic_nurse" && user.role !== "super_admin") {
    redirect("/dashboard");
  }
  return <CarePlansListClient />;
}
