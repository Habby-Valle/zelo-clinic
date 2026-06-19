"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSystemConfig } from "@/features/system-config";

export function FeedbackGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: systemConfig, isLoading } = useSystemConfig();

  useEffect(() => {
    if (!isLoading && systemConfig?.feedback_visible === false) {
      router.replace("/dashboard");
    }
  }, [isLoading, systemConfig, router]);

  if (isLoading) return null;
  if (systemConfig?.feedback_visible === false) return null;

  return children;
}
