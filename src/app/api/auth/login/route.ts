import { NextRequest, NextResponse } from "next/server";
import { loginApi } from "@/features/auth";
import { ApiError } from "@/lib/api";
import { decodeJwt } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
  }

  let data;
  try {
    data = await loginApi(body.email, body.password);
  } catch (err) {
    if (err instanceof ApiError) {
      const message =
        err.status === 400 ? "E-mail ou senha incorretos." : "Ocorreu um erro. Tente novamente.";
      return NextResponse.json({ error: message }, { status: err.status });
    }
    return NextResponse.json({ error: "Ocorreu um erro. Tente novamente." }, { status: 500 });
  }

  const role = data.user.profile?.role;
  if (role !== "clinic_admin") {
    return NextResponse.json({ error: "Acesso não permitido para este perfil." }, { status: 403 });
  }

  const response = NextResponse.json({
    role,
    user: {
      id: String(data.user.id),
      email: data.user.email,
      name: data.user.profile?.name ?? "",
      role: data.user.profile?.role ?? "",
      clinic_id: data.user.profile?.clinic_id ?? null,
    },
  });

  const isProduction = process.env.NODE_ENV === "production";

  const accessPayload = decodeJwt(data.access);
  const refreshPayload = decodeJwt(data.refresh);
  const now = Math.floor(Date.now() / 1000);
  const accessMaxAge = accessPayload ? accessPayload.exp - now : 60 * 60 * 24;
  const refreshMaxAge = refreshPayload ? refreshPayload.exp - now : 60 * 60 * 24 * 7;

  response.cookies.set("ze_access", data.access, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: accessMaxAge,
    path: "/",
  });

  response.cookies.set("ze_refresh", data.refresh, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: refreshMaxAge,
    path: "/",
  });

  return response;
}
