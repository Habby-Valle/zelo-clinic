import { redirect } from "next/navigation";
import { requireClinicUser } from "@/lib/auth";
import { apiFetchServer } from "@/lib/api";
import type { Clinic } from "@/features/clinic/types";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { OnboardingWrapper } from "@/features/onboarding/components/onboarding-wrapper";
import { AsaasConfigBanner } from "@/features/clinic/components";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireClinicUser();

  // Admin de clínica precisa concluir o onboarding (dados, logo e ASAAS) antes
  // de acessar o painel. Enfermeiros não passam por esse fluxo.
  if (user.role === "clinic_admin") {
    const clinic = await apiFetchServer<Clinic>("/clinics/me/").catch(() => null);
    if (clinic && !clinic.onboarding_completed) redirect("/onboarding");
  }

  return (
    <div className="flex h-screen">
      <aside className="hidden w-64 shrink-0 md:block">
        <Sidebar role={user.role} />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar role={user.role} />
        <main className="flex-1 overflow-auto p-6">
          <AsaasConfigBanner role={user.role} />
          {children}
        </main>
      </div>
      <OnboardingWrapper />
    </div>
  );
}
