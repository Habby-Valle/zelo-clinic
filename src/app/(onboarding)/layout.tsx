import { redirect } from "next/navigation";
import { requireClinicAdmin } from "@/lib/auth";
import { apiFetchServer } from "@/lib/api";
import type { Clinic } from "@/features/clinic/types";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // Somente o admin da clínica configura o onboarding.
  await requireClinicAdmin();

  // Já concluído? Não deixa reabrir o fluxo.
  const clinic = await apiFetchServer<Clinic>("/clinics/me/").catch(() => null);
  if (clinic?.onboarding_completed) redirect("/dashboard");

  return <div className="min-h-screen bg-muted/30">{children}</div>;
}
