import { NextResponse } from "next/server";
import { decodeJwt } from "@/lib/jwt";

/**
 * Grava os cookies httpOnly de sessão (ze_access/ze_refresh) numa resposta.
 * Lógica compartilhada entre o login e o SSO do painel web.
 */
export function setAuthCookies(response: NextResponse, access: string, refresh: string) {
  const isProduction = process.env.NODE_ENV === "production";
  const now = Math.floor(Date.now() / 1000);

  const accessPayload = decodeJwt(access);
  const refreshPayload = decodeJwt(refresh);
  const accessMaxAge = accessPayload ? accessPayload.exp - now : 60 * 60 * 24;
  const refreshMaxAge = refreshPayload ? refreshPayload.exp - now : 60 * 60 * 24 * 7;

  response.cookies.set("ze_access", access, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: accessMaxAge,
    path: "/",
  });

  response.cookies.set("ze_refresh", refresh, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: refreshMaxAge,
    path: "/",
  });

  return response;
}
