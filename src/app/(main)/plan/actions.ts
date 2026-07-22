"use server";

import { revalidatePath } from "next/cache";
import { requireClinicAdmin } from "@/lib/auth";
import { apiFetchServer } from "@/lib/api";
import type { Plan, ClinicPlan } from "@/features/plan/types";

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

export async function requestPlanChange(
  planId: string,
  billingCycle: "monthly" | "quarterly" | "annual" = "monthly"
): Promise<{
  success: boolean;
  error?: string;
  checkoutUrl?: string;
  pixQrCode?: string;
  pixPayload?: string;
  billingType?: "PIX" | "CREDIT_CARD" | null;
}> {
  const { user } = await requireClinicAdmin();

  let targetPlan: DjangoPlan | null = null;
  try {
    const data = await apiFetchServer<DjangoPlanList>(`/plans/?page_size=100&scope=clinic`);
    targetPlan = (data.results ?? []).find((p) => String(p.id) === planId) ?? null;
  } catch {
    return { success: false, error: "Plano não encontrado" };
  }

  if (!targetPlan) return { success: false, error: "Plano não encontrado" };

  const isFreeOrTrial = Number(targetPlan.monthly_price) === 0 || targetPlan.is_trial;

  if (isFreeOrTrial) {
    try {
      const endpoint = targetPlan.is_trial
        ? "/subscriptions/me/activate-trial/"
        : "/subscriptions/me/activate-free/";

      await apiFetchServer(endpoint, {
        method: "POST",
        body: JSON.stringify({ plan_id: targetPlan.id }),
      });
      revalidatePath("/plan");
      revalidatePath("/dashboard");
      return { success: true, billingType: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao ativar plano";
      return { success: false, error: msg };
    }
  }

  return { success: true };
}

export async function asaasSubscribe(
  planId: string,
  billingType: "PIX" | "CREDIT_CARD",
  billingCycle: "MONTHLY" | "QUARTERLY" | "YEARLY"
): Promise<{
  success: boolean;
  error?: string;
  checkoutUrl?: string;
  pixQrCode?: string;
  pixPayload?: string;
  billingType?: "PIX" | "CREDIT_CARD";
  planChange?: boolean;
  scheduled?: boolean;
  prorataValue?: number;
}> {
  try {
    const data = await apiFetchServer<{
      subscription_id: string;
      checkout_url?: string;
      pix_qr_code?: string;
      pix_payload?: string;
      billing_type: "PIX" | "CREDIT_CARD";
      plan_change?: boolean;
      scheduled?: boolean;
      prorata_value?: number;
    }>("/asaas/plans/subscribe/", {
      method: "POST",
      body: JSON.stringify({
        plan_id: planId,
        billing_type: billingType,
        billing_cycle: billingCycle,
      }),
    });
    revalidatePath("/plan");
    revalidatePath("/dashboard");
    return {
      success: true,
      checkoutUrl: data.checkout_url,
      pixQrCode: data.pix_qr_code,
      pixPayload: data.pix_payload,
      billingType: data.billing_type,
      planChange: data.plan_change,
      scheduled: data.scheduled,
      prorataValue: data.prorata_value,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao criar assinatura";
    return { success: false, error: msg };
  }
}

export interface PlanPayment {
  id: string;
  asaas_payment_id: string;
  amount: string;
  status: string;
  payment_method: string;
  paid_at: string | null;
  due_date: string;
  created_at: string;
}

export async function getPlanPaymentPix(
  paymentId: string
): Promise<{ pixQrCode: string; pixPayload: string } | null> {
  try {
    const data = await apiFetchServer<{ pix_qr_code: string; pix_payload: string }>(
      `/asaas/plan-payments/${paymentId}/pix/`
    );
    return { pixQrCode: data.pix_qr_code, pixPayload: data.pix_payload };
  } catch {
    return null;
  }
}

export async function manageGetClinic(): Promise<{
  id: string;
  name: string;
  subscription: {
    asaas_subscription_id: string;
    billing_type: string;
    status: string;
  } | null;
  payments: PlanPayment[];
} | null> {
  try {
    const clinicData = await apiFetchServer<{ id: string; name: string }>("/clinics/me/");
    const subData = await apiFetchServer<{
      subscription: {
        asaas_subscription_id: string;
        billing_type: string;
        status: string;
      } | null;
      payments: PlanPayment[];
    }>("/asaas/plans/me/");
    return {
      id: clinicData.id,
      name: clinicData.name,
      subscription: subData.subscription ?? null,
      payments: subData.payments ?? [],
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
    await apiFetchServer("/asaas/plans/cancel/", { method: "POST" });
    revalidatePath("/plan");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao cancelar assinatura";
    return { success: false, error: msg };
  }
}
