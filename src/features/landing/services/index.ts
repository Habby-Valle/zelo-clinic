import { apiFetch } from "@/lib/api";
import { apiFetchClient } from "@/lib/api-client";
import type { PublicPlan, LeadInput } from "@/features/landing/types";

/** Busca os planos públicos (server-side, sem autenticação). */
export async function getPublicPlans(): Promise<PublicPlan[]> {
  return apiFetch<PublicPlan[]>("/plans/public/");
}

/** Envia um lead da landing page (endpoint público). */
export async function createLead(data: LeadInput): Promise<void> {
  await apiFetchClient<void>("/leads/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
