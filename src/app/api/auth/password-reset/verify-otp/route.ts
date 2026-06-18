import { NextRequest, NextResponse } from "next/server"
import { apiFetch, ApiError } from "@/lib/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await apiFetch<{ success: boolean; reset_token: string }>(
      "/auth/password-reset/verify-otp/",
      {
        method: "POST",
        body: JSON.stringify({ email: body.email, otp: body.otp }),
      }
    )
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Erro ao verificar código" }, { status: 500 })
  }
}
