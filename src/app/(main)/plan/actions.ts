"use server";

import { revalidatePath } from "next/cache";
import { requireClinicAdmin } from "@/lib/auth";
import { apiFetchServer } from "@/lib/api";
import type { Plan, ClinicPlan } from "@/features/plan/types";

// ─── Django API Types ─────────────────────────────────────────────────────────

interface DjangoPlan {
  id: number;
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number | null;
  is_active: boolean;
  benefits: {
    id: number;
    benefit_id: number;
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
  id: number;
  status: string;
  start_date: string;
  end_date: string | null;
  trial_ends_at: string | null;
  payment_failed_at: string | null;
  plan: {
    id: number;
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
    id: String(d.id),
    name: d.name,
    description: d.description,
    monthly_price: d.monthly_price,
    yearly_price: d.yearly_price,
    is_active: d.is_active,
    benefits: d.benefits.map((b) => ({
      id: String(b.id),
      benefit_id: String(b.benefit_id),
      benefit_key: b.benefit_key,
      benefit_label: b.benefit_label,
      value: b.value,
    })),
  };
}

function normalizeClinicPlan(d: DjangoSubscriptionMe): ClinicPlan {
  return {
    id: String(d.id),
    plan_id: String(d.plan.id),
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
    const data = await apiFetchServer<Record<string, unknown>>("/system-config/public/");
    return (data.plans_enabled as boolean) ?? false;
  } catch {
    return false;
  }
}

export async function requestPlanChange(
  planId: string,
  billingCycle: "monthly" | "quarterly" | "annual" = "monthly"
): Promise<{ success: boolean; error?: string; checkoutUrl?: string }> {
  const { user } = await requireClinicAdmin();
  const clinicId = user.clinic_id;
  if (!clinicId) return { success: false, error: "Clínica não encontrada." };

  let targetPlan: DjangoPlan | null = null;
  try {
    const data = await apiFetchServer<DjangoPlanList>(`/plans/?page_size=100&scope=clinic`);
    targetPlan = (data.results ?? []).find((p) => String(p.id) === planId) ?? null;
  } catch {
    return { success: false, error: "Plano não encontrado" };
  }

  if (!targetPlan) return { success: false, error: "Plano não encontrado" };

  if (targetPlan.monthly_price === 0) {
    try {
      await apiFetchServer("/subscriptions/me/activate-free/", {
        method: "POST",
        body: JSON.stringify({ plan_id: targetPlan.id }),
      });
      revalidatePath("/plan");
      revalidatePath("/dashboard");
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao ativar plano";
      return { success: false, error: msg };
    }
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("ze_access")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

  const stripeResponse = await fetch(`${baseUrl}/api/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ planId, clinicId, billingCycle }),
  });

  const stripeData = await stripeResponse.json();

  if (!stripeResponse.ok || !stripeData.url) {
    return {
      success: false,
      error: stripeData.error ?? "Erro ao criar checkout",
    };
  }

  return { success: true, checkoutUrl: stripeData.url };
}

export async function manageGetClinic(): Promise<{
  id: string;
  name: string;
  stripe_customer_id: string | null;
} | null> {
  try {
    const [clinicData, customerData] = await Promise.all([
      apiFetchServer<{ id: number; name: string }>("/clinics/me/"),
      apiFetchServer<{ stripe_customer_id: string | null }>("/payments/customer/me/"),
    ]);
    return {
      id: String(clinicData.id),
      name: clinicData.name,
      stripe_customer_id: customerData.stripe_customer_id ?? null,
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
    await apiFetchServer("/subscriptions/me/cancel/", { method: "POST", body: JSON.stringify({}) });
    revalidatePath("/plan");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro ao cancelar assinatura";
    return { success: false, error: msg };
  }
}

export async function syncStripeSubscription(): Promise<{ synced: boolean }> {
  try {
    const data = await apiFetchServer<{ status: string; synced: boolean }>(
      "/subscriptions/me/sync-stripe/",
      { method: "POST", body: JSON.stringify({}) }
    );
    if (data.synced) {
      revalidatePath("/plan");
      revalidatePath("/dashboard");
    }
    return { synced: data.synced ?? false };
  } catch {
    return { synced: false };
  }
}
