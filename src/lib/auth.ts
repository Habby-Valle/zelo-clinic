import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { decodeJwt, isTokenExpired } from "@/lib/jwt"
import { getMeApi } from "@/features/auth"
import type { AuthUser } from "@/types/auth"
import type { UserRole } from "@/types/common"

async function getValidAccessToken(): Promise<string> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("ze_access")?.value

  if (!accessToken) redirect("/login")

  const payload = decodeJwt(accessToken)
  if (!payload || isTokenExpired(payload)) redirect("/login")

  return accessToken
}

export interface ClinicAdminContext {
  user: AuthUser
}

export async function requireClinicAdmin(): Promise<ClinicAdminContext> {
  const accessToken = await getValidAccessToken()

  const payload = decodeJwt(accessToken)!
  if (payload.role !== "clinic_admin") redirect("/login")

  let meData
  try {
    meData = await getMeApi(accessToken)
  } catch {
    redirect("/login")
  }

  const profile = meData.profile
  if (!profile) redirect("/login")

  const user: AuthUser = {
    id: String(meData.id),
    email: meData.email,
    name: profile.name,
    role: profile.role as UserRole,
    clinic_id: profile.clinic_id,
    avatar_url: null,
  }

  return { user }
}
