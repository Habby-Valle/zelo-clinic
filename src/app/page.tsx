import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decodeJwt } from "@/lib/jwt";
import { LandingPage } from "@/features/landing/components";

export const metadata: Metadata = {
  title: "Zelo — Gestão de cuidados para clínicas e famílias",
  description:
    "O Zelo conecta clínicas, cuidadores e famílias: turnos, checklists, medicações e relatórios de cada visita, com transparência total.",
  openGraph: {
    title: "Zelo — Gestão de cuidados para clínicas e famílias",
    description:
      "Plataforma única para coordenar cuidados, dar transparência às famílias e ter controle da operação da sua clínica.",
    type: "website",
  },
};

export default async function Home() {
  const token = (await cookies()).get("ze_access")?.value;
  const role = token ? decodeJwt(token)?.role : null;

  // Usuário autenticado vai direto para o painel; visitante vê a landing.
  if (role) {
    // Enfermeiro não tem dashboard — vai para os planos de cuidado.
    redirect(role === "clinic_nurse" ? "/care-plans" : "/dashboard");
  }

  return <LandingPage />;
}
