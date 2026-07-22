import { NextRequest, NextResponse } from "next/server";
import { decodeJwt, isTokenExpired } from "@/lib/jwt";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function refreshAccess(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access?: string };
    return data.access ?? null;
  } catch {
    return null;
  }
}

/**
 * Renova o access token silenciosamente antes de cada request.
 *
 * O `ze_access` vive ~15min; sem isso, ao expirar, o `requireClinicRole` de
 * `lib/auth.ts` redirecionava direto pro /login — deslogando o usuário a cada
 * 15min mesmo com um `ze_refresh` válido (7 dias). O middleware roda antes da
 * página (pode setar cookies, o que Server Components não podem) e injeta o
 * novo access token no request e na resposta. Nunca força login por conta
 * própria — páginas públicas seguem intactas; a decisão de barrar continua
 * com cada página protegida.
 */
export async function middleware(request: NextRequest) {
  const access = request.cookies.get("ze_access")?.value;
  const payload = access ? decodeJwt(access) : null;

  // Access ainda válido → segue direto.
  if (payload && !isTokenExpired(payload)) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get("ze_refresh")?.value;
  if (!refreshToken) {
    // Anônimo ou sem refresh: deixa a página decidir (público segue, protegido redireciona).
    return NextResponse.next();
  }

  const newAccess = await refreshAccess(refreshToken);
  if (!newAccess) {
    // Refresh inválido/expirado: limpa os cookies para não reprocessar a cada request.
    const response = NextResponse.next();
    response.cookies.delete("ze_access");
    response.cookies.delete("ze_refresh");
    return response;
  }

  const newPayload = decodeJwt(newAccess);
  const now = Math.floor(Date.now() / 1000);
  const maxAge = newPayload ? newPayload.exp - now : 60 * 60;

  // Propaga o novo access token para o handler/página (request) e para o browser (response).
  request.cookies.set("ze_access", newAccess);
  const response = NextResponse.next({ request });
  response.cookies.set("ze_access", newAccess, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });
  return response;
}

export const config = {
  // Roda em tudo, exceto assets estáticos e as rotas de auth (login/refresh/logout
  // não devem ser interceptadas — elas mesmas gerenciam os cookies).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
