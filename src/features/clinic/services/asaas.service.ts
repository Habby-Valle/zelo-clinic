import { apiFetchClient } from "@/lib/api-client";

export interface AsaasConfig {
  api_key: string;
  wallet_id: string;
  is_active: boolean;
  has_api_key?: boolean;
}

export async function getAsaasConfig(): Promise<AsaasConfig> {
  return apiFetchClient<AsaasConfig>("/asaas/config/me/");
}

export interface UpdateAsaasConfigData {
  api_key?: string;
  wallet_id?: string;
}

export async function updateAsaasConfig(data: UpdateAsaasConfigData): Promise<AsaasConfig> {
  return apiFetchClient<AsaasConfig>("/asaas/config/me/", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function testAsaasConnection(
  apiKey?: string
): Promise<{ success: boolean; message: string }> {
  return apiFetchClient<{ success: boolean; message: string }>("/asaas/config/test/", {
    method: "POST",
    body: JSON.stringify({ api_key: apiKey }),
  });
}

export interface PlanSubscribeInput {
  plan_id: string;
  billing_type: "PIX" | "CREDIT_CARD";
  billing_cycle: "MONTHLY" | "QUARTERLY" | "YEARLY";
}

export interface PlanSubscribeResult {
  subscription_id: string;
  pix_qr_code?: string;
  pix_payload?: string;
  checkout_url?: string;
  billing_type: "PIX" | "CREDIT_CARD";
}

export async function subscribeToPlan(data: PlanSubscribeInput): Promise<PlanSubscribeResult> {
  return apiFetchClient<PlanSubscribeResult>("/asaas/plans/subscribe/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function cancelPlanSubscription(): Promise<{ success: boolean }> {
  return apiFetchClient<{ success: boolean }>("/asaas/plans/cancel/", {
    method: "POST",
  });
}

export interface AsaasPlanSubscriptionData {
  subscription: {
    id: string;
    asaas_subscription_id: string;
    billing_type: string;
    status: string;
    plan_name: string;
    plan_price: string;
    current_period_start: string;
    current_period_end: string;
    canceled_at: string | null;
  } | null;
  payments: {
    id: string;
    asaas_payment_id: string;
    amount: string;
    status: string;
    payment_method: string;
    paid_at: string | null;
    due_date: string;
    created_at: string;
  }[];
}

export async function getPlanSubscription(): Promise<AsaasPlanSubscriptionData> {
  return apiFetchClient<AsaasPlanSubscriptionData>("/asaas/plans/me/");
}
