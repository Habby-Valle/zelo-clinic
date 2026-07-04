"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import type { UserRole } from "@/types/common";

interface LoginVariables {
  email: string;
  password: string;
}

interface LoginResult {
  role: UserRole;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    clinic_id: string | null;
  };
}

async function loginRequest(variables: LoginVariables): Promise<LoginResult> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(variables),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? "Ocorreu um erro.");
  }

  return data as LoginResult;
}

export function useLogin() {
  return useMutation<LoginResult, ApiError, LoginVariables>({
    mutationFn: loginRequest,
  });
}
