import { NextRequest, NextResponse } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";
import { setAuthCookies } from "@/lib/auth-cookies";

interface SsoConsumeResponse {
  access: string;
  refresh: string;
  user: {
    profile?: { role?: string };
  };
}

/**
 * SSO app → painel web: recebe um ticket de uso único (emitido pela API para
 * o usuário logado no app), troca por um par JWT válido, grava os cookies de
 * sessão e redireciona para o painel (que direciona por papel).
 */
export async function GET(request: NextRequest) {
  const ticket = request.nextUrl.searchParams.get("ticket");

  if (!ticket) {
    return NextResponse.redirect(new URL("/login?error=sso", request.nextUrl.origin));
  }

  let data: SsoConsumeResponse;
  try {
    data = await apiFetch<SsoConsumeResponse>("/auth/sso/consume/", {
      method: "POST",
      body: JSON.stringify({ ticket }),
    });
  } catch (err) {
    if (err instanceof ApiError) {
      console.warn(`SSO consume falhou (${err.status}): ${err.message}`);
    } else {
      console.error("SSO consume: erro inesperado", err);
    }
    return NextResponse.redirect(new URL("/login?error=sso", request.nextUrl.origin));
  }

  const role = data.user.profile?.role;
  if (role !== "clinic_admin" && role !== "clinic_nurse") {
    return NextResponse.redirect(new URL("/login?error=sso", request.nextUrl.origin));
  }

  const response = NextResponse.redirect(
    new URL(role === "clinic_nurse" ? "/care-plans" : "/dashboard", request.nextUrl.origin)
  );
  setAuthCookies(response, data.access, data.refresh);

  return response;
}
