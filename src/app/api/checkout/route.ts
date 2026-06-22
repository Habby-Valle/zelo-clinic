import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { apiFetch } from "@/lib/api";
import { cookies } from "next/headers";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2026-05-27.dahlia",
  });
}

interface CheckoutRequest {
  planId: string;
  clinicId: string;
  billingCycle?: "monthly" | "quarterly" | "annual";
}

interface DjangoPlanList {
  count: number;
  results: {
    id: string;
    name: string;
    description: string;
    monthly_price: number;
    yearly_price: number | null;
  }[];
}

async function getToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  return authHeader?.replace("Bearer ", "") ?? (await cookies()).get("ze_access")?.value ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { planId, clinicId, billingCycle = "monthly" } = body;

    if (!planId || !clinicId) {
      return NextResponse.json({ error: "planId e clinicId são obrigatórios" }, { status: 400 });
    }

    const token = await getToken(request);
    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const plansData = await apiFetch<DjangoPlanList>(`/plans/?page_size=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const plan = plansData.results.find((p) => String(p.id) === planId);
    if (!plan) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }

    const price = plan.monthly_price;
    const description = plan.description || `Plano ${plan.name} - cobrança ${billingCycle}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: { name: plan.name, description },
            unit_amount: Math.round(price * 100),
            recurring: {
              interval:
                billingCycle === "monthly"
                  ? "month"
                  : billingCycle === "quarterly"
                    ? "month"
                    : "year",
              interval_count: billingCycle === "quarterly" ? 3 : 1,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        plan_id: String(plan.id),
        clinic_id: String(clinicId),
        billing_cycle: billingCycle,
      },
      subscription_data: {
        metadata: {
          plan_id: String(plan.id),
          clinic_id: String(clinicId),
          billing_cycle: billingCycle,
        },
      },
      success_url: `${appUrl}/plan?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/plan?canceled=true`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Erro ao criar sessão de checkout" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("[checkout] Error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
