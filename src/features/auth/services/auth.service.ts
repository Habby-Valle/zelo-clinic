import { apiFetch } from "@/lib/api";

export interface ApiProfile {
  id: number;
  name: string;
  phone: string;
  role: string;
  clinic_id: string | null;
}

export interface ApiUser {
  id: number;
  email: string;
  is_active: boolean;
  profile: ApiProfile | null;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: ApiUser;
}

export interface RefreshResponse {
  access: string;
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutApi(refreshToken: string, accessToken: string): Promise<void> {
  return apiFetch<void>("/auth/logout/", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ refresh: refreshToken }),
  });
}

export async function getMeApi(accessToken: string): Promise<ApiUser> {
  return apiFetch<ApiUser>("/auth/me/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function refreshTokenApi(refreshToken: string): Promise<RefreshResponse> {
  return apiFetch<RefreshResponse>("/auth/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh: refreshToken }),
  });
}
