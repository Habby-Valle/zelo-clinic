import { PatientDetailClient } from "@/features/patients";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params;
  return <PatientDetailClient id={id} />;
}
