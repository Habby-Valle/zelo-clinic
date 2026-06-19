"use client";

import { useAuthStore } from "@/store/authStore";

export function useCurrentUser() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const hasHydrated = useAuthStore.persist?.hasHydrated?.() ?? true;
  return { user, isLoading, hasHydrated };
}
