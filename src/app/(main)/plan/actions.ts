"use server";

import { revalidatePath } from "next/cache";
import { apiFetchServer } from "@/lib/api";
import {
  cancelClinicSubscription,
  createCheckoutSession,
  createPortalSession,
  getClinicBilling,
  type GatewaySubscription,
  type PlanPayment,
} from "@/features/plan/services/clinic-billing.service";
import type { Plan, ClinicPlan } from "@/features/plan/types";

// Os tipos não são reexportados daqui: num módulo "use server" todo export
// vira uma action, e reexportar tipo quebra o build. Quem precisa importa do
// serviço — `import type` some na compilação, então o cliente não carrega
// nada do servidor junto.

// ─── Django API Types ─────────────────────────────────────────────────────────

interface DjangoPlan {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number | null;
  is_active: boolean;
  is_trial: boolean;
  benefits: {
    id: string;
    benefit_id: string;
    benefit_key: string;
    benefit_label: string;
    value: string;
  }[];
}

interface DjangoPlanList {
  count: number;
  results: DjangoPlan[];
}

interface DjangoSubscriptionMe {
  id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  trial_ends_at: string | null;
  payment_failed_at: string | null;
  plan: {
    id: string;
    name: string;
    description: string;
    monthly_price: number;
    yearly_price: number | null;
  };
  has_used_trial: boolean;
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normalizePlan(d: DjangoPlan): Plan {
  return {
    id: d.id,
    name: d.name,
    description: d.description,
    monthly_price: Number(d.monthly_price),
    yearly_price: d.yearly_price ? Number(d.yearly_price) : null,
    is_active: d.is_active,
    benefits: d.benefits.map((b) => ({
      id: b.id,
      benefit_id: b.benefit_id,
      benefit_key: b.benefit_key,
      benefit_label: b.benefit_label,
      value: b.value,
    })),
  };
}

function normalizeClinicPlan(d: DjangoSubscriptionMe): ClinicPlan {
  return {
    id: d.id,
    plan_id: d.plan.id,
    status: d.status as ClinicPlan["status"],
    started_at: d.start_date,
    expires_at: d.end_date ?? null,
    trial_ends_at: d.trial_ends_at ?? null,
    payment_failed_at: d.payment_failed_at ?? null,
  };
}

// ─── Server Actions ───────────────────────────────────────────────────────────

export interface ClinicPlanInfo {
  clinicPlan: ClinicPlan | null;
  plan: Plan | null;
  hasUsedTrial?: boolean;
}

export async function getMyClinicPlan(): Promise<ClinicPlanInfo | null> {
  try {
    const data = await apiFetchServer<DjangoSubscriptionMe>("/subscriptions/me/");
    if (!data || !data.plan) {
      return { clinicPlan: null, plan: null, hasUsedTrial: data?.has_used_trial ?? false };
    }
    return {
      clinicPlan: normalizeClinicPlan(data),
      plan: normalizePlan({
        id: data.plan.id,
        name: data.plan.name,
        description: data.plan.description,
        monthly_price: data.plan.monthly_price,
        yearly_price: data.plan.yearly_price,
        is_active: true,
        is_trial: false,
        benefits: [],
      }),
      hasUsedTrial: data.has_used_trial ?? false,
    };
  } catch {
    return { clinicPlan: null, plan: null };
  }
}

export async function getAllPlans(): Promise<Plan[]> {
  try {
    const data = await apiFetchServer<DjangoPlanList>(
      "/plans/?is_active=true&scope=clinic&page_size=100"
    );
    return (data.results ?? [])
      .map(normalizePlan)
      .sort((a, b) => a.monthly_price - b.monthly_price);
  } catch {
    return [];
  }
}

export async function arePlansEnabled(): Promise<boolean> {
  try {
    const data = await apiFetchServer<Record<string, unknown>>("/public/system/");
    return (data.plans_enabled as boolean) ?? false;
  } catch {
    return false;
  }
}

/** Ativa um plano sem cobrança (trial).
 *
 *  Não passa por gateway porque não há o que cobrar: o trial da clínica é um
 *  plano próprio de R$ 0, e não dias de teste sobre um plano pago como no
 *  familiar. Devolve `handled: false` quando o plano é pago — aí quem assume é
 *  o `subscribeToPlan`. */
export async function activateFreePlan(planId: string): Promise<{
  success: boolean;
  handled: boolean;
  error?: string;
}> {
  let targetPlan: DjangoPlan | null = null;
  try {
    const data = await apiFetchServer<DjangoPlanList>(`/plans/?page_size=100&scope=clinic`);
    targetPlan = (data.results ?? []).find((p) => String(p.id) === planId) ?? null;
  } catch {
    return { success: false, handled: true, error: "Plano não encontrado" };
  }

  if (!targetPlan) return { success: false, handled: true, error: "Plano não encontrado" };

  // Só o trial entra aqui. O plano "Gratuito" foi removido do catálogo — a
  // clínica nasce sem plano —, então não há mais um caminho de ativação sem
  // cobrança fora do teste.
  if (!targetPlan.is_trial) {
    return { success: true, handled: false };
  }

  try {
    await apiFetchServer("/subscriptions/me/activate-trial/", {
      method: "POST",
      body: JSON.stringify({ plan_id: targetPlan.id }),
    });
    revalidatePath("/plan");
    revalidatePath("/dashboard");
    return { success: true, handled: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao ativar plano";
    return { success: false, handled: true, error: msg };
  }
}

/** Assina um plano pago.
 *
 *  Devolve a URL do checkout hospedado — quem cobra o cartão é o gateway, numa
 *  página dele. Trocar de plano não passa por lá: já existe cartão salvo e o
 *  proporcional é nativo, então a resposta volta com `planChange`. */
export async function subscribeToPlan(planId: string): Promise<{
  success: boolean;
  error?: string;
  checkoutUrl?: string | null;
  planChange?: boolean;
  prorataValue?: number;
  nextChargeDate?: string | null;
}> {
  try {
    const data = await createCheckoutSession(planId);
    revalidatePath("/plan");
    revalidatePath("/dashboard");
    return {
      success: true,
      checkoutUrl: data.checkout_url,
      planChange: data.plan_change,
      prorataValue: data.prorata_value,
      nextChargeDate: data.next_charge_date ?? null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao iniciar a assinatura";
    return { success: false, error: msg };
  }
}

/** Abre o portal de cobrança para trocar o cartão. */
export async function openBillingPortal(): Promise<{
  success: boolean;
  error?: string;
  portalUrl?: string;
}> {
  try {
    const { portal_url } = await createPortalSession();
    return { success: true, portalUrl: portal_url };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao abrir o gerenciamento";
    return { success: false, error: msg };
  }
}

export async function manageGetClinic(): Promise<{
  id: string;
  name: string;
  subscription: GatewaySubscription | null;
  payments: PlanPayment[];
} | null> {
  try {
    const clinicData = await apiFetchServer<{ id: string; name: string }>("/clinics/me/");
    const billing = await getClinicBilling();
    return {
      id: clinicData.id,
      name: clinicData.name,
      subscription: billing.subscription,
      payments: billing.payments,
    };
  } catch {
    return null;
  }
}

export async function cancelSubscription(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await cancelClinicSubscription();
    revalidatePath("/plan");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao cancelar assinatura";
    return { success: false, error: msg };
  }
}
