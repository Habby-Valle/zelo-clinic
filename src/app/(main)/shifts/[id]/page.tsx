import { use } from "react";
import { ShiftDetailClient } from "@/features/shifts/components";

export const metadata = { title: "Turno — Zelo Clinic" };

interface Props {
  params: Promise<{ id: string }>;
}

export default function ShiftDetailPage({ params }: Props) {
  const { id } = use(params);
  return <ShiftDetailClient id={id} />;
}
