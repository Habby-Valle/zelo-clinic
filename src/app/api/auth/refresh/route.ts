import { NextRequest, NextResponse } from "next/server";
import { refreshTokenApi } from "@/features/auth";
import { decodeJwt } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  const rawFrom = request.nextUrl.searchParams.get("from") ?? "/";
  const from = rawFrom.startsWith("/") && !rawFrom.startsWith("//") ? rawFrom : "/";
  const refreshToken = request.cookies.get("ze_refresh")?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let data;
  try {
    data = await refreshTokenApi(refreshToken);
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("ze_access");
    response.cookies.delete("ze_refresh");
    return response;
  }

  const accessPayload = decodeJwt(data.access);
  const now = Math.floor(Date.now() / 1000);
  const accessMaxAge = accessPayload ? accessPayload.exp - now : 60 * 60 * 24;

  const response = NextResponse.redirect(new URL(from, request.url));
  response.cookies.set("ze_access", data.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: accessMaxAge,
    path: "/",
  });

  return response;
}
