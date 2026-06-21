import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { ApiError } from "@/lib/api";

interface Params {
  params: Promise<{ token: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params;

  try {
    const data = await apiFetch<{
      email: string;
      role: string;
      clinic_name: string | null;
    }>(`/invites/accept/${token}/`);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { token } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 });
  }

  try {
    const data = await apiFetch(`/invites/accept/${token}/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
