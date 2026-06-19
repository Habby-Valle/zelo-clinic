"use client";

import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
} as const;

interface MaterialIconProps {
  name: string;
  className?: string;
  size?: keyof typeof SIZE_CLASS;
}

export function MaterialIcon({ name, className, size = "md" }: MaterialIconProps) {
  return (
    <span
      className={cn("material-icons select-none", SIZE_CLASS[size], className)}
      aria-hidden="true"
    >
      {name.replace(/-/g, "_")}
    </span>
  );
}
