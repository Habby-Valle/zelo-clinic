import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { apiFetchServer } from "@/lib/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-05-27.dahlia",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const returnUrl = (body as { returnUrl?: string }).returnUrl;

    const customerData = await apiFetchServer<{
      stripe_customer_id: string | null;
    }>("/payments/customer/me/");

    if (!customerData?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Cliente Stripe não encontrado. Efetue um pagamento primeiro." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
    const finalReturnUrl = returnUrl ?? `${appUrl}/plan?portal_return=true`;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerData.stripe_customer_id,
      return_url: finalReturnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[portal] Error:", error);
    return NextResponse.json({ error: "Erro ao criar sessão do portal" }, { status: 500 });
  }
}
