import { NextRequest, NextResponse } from "next/server"
import { apiFetch, ApiError } from "@/lib/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    await apiFetch("/auth/password-reset/", {
      method: "POST",
      body: JSON.stringify({ email: body.email }),
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
