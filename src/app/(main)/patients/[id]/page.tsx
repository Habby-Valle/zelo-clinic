import { PatientDetailClient } from "@/features/patients";

export const metadata = { title: "Paciente — Zelo Clinic" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params;
  return <PatientDetailClient id={id} />;
}
