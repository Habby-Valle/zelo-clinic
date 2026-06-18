import { NextRequest, NextResponse } from "next/server"
import { logoutApi } from "@/features/auth"

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("ze_refresh")?.value
  const accessToken = request.cookies.get("ze_access")?.value

  if (refreshToken && accessToken) {
    try {
      await logoutApi(refreshToken, accessToken)
    } catch {
      // Token já expirado ou inválido — continua com limpeza de cookies
    }
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete("ze_access")
  response.cookies.delete("ze_refresh")

  return response
}
