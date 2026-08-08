import { NextRequest, NextResponse } from "next/server";
import { loginApi } from "@/features/auth";
import { ApiError } from "@/lib/api";
import { setAuthCookies } from "@/lib/auth-cookies";

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
  if (role !== "clinic_admin" && role !== "clinic_nurse") {
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
      avatar_url: data.user.profile?.avatar_url ?? null,
    },
  });

  setAuthCookies(response, data.access, data.refresh);

  return response;
}
