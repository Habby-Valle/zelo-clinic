import { apiFetchServer } from "@/lib/api";

/** Assinatura da clínica no gateway de cobrança. */
export interface GatewaySubscription {
  id: string;
  plan_name: string | null;
  plan_price: string | null;
  billing_type: string;
  billing_cycle: string;
  status: string;
  is_current: boolean;
  cancel_at_period_end: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
}

/** Uma mensalidade no extrato. */
export interface PlanPayment {
  id: string;
  stripe_invoice_id: string;
  amount: string;
  status: string;
  payment_method: string;
  hosted_invoice_url: string;
  paid_at: string | null;
  due_date: string;
  created_at: string;
  receipt_number: string | null;
  plan_name: string | null;
}

export interface ClinicBilling {
  subscription: GatewaySubscription | null;
  payments: PlanPayment[];
  clinic_plan: {
    id: string;
    status: string;
    plan_name: string | null;
    start_date: string;
    end_date: string | null;
    trial_ends_at: string | null;
  } | null;
}

/** Resposta do subscribe: ou uma URL de checkout, ou uma troca já efetivada.
 *
 *  Assinatura nova passa pelo checkout hospedado; troca de plano não — o
 *  cartão já está salvo e o proporcional é nativo do gateway. */
export interface SubscribeResult {
  checkout_url: string | null;
  plan_change: boolean;
  prorata_value?: number;
  next_charge_date?: string | null;
}

export async function createCheckoutSession(planId: string): Promise<SubscribeResult> {
  return apiFetchServer<SubscribeResult>("/stripe/clinic/subscribe/", {
    method: "POST",
    body: JSON.stringify({ plan_id: planId }),
  });
}

export async function getClinicBilling(): Promise<ClinicBilling> {
  return apiFetchServer<ClinicBilling>("/stripe/clinic/me/");
}

export async function cancelClinicSubscription(): Promise<void> {
  await apiFetchServer("/stripe/clinic/cancel/", { method: "POST" });
}

/** Portal de cobrança do Stripe — troca de cartão e faturas, hospedado. */
export async function createPortalSession(): Promise<{ portal_url: string }> {
  return apiFetchServer<{ portal_url: string }>("/stripe/clinic/portal/", {
    method: "POST",
  });
}
