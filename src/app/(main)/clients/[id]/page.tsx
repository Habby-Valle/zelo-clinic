import { FamilyMemberDetailClient } from "@/features/family-members";

export const metadata = { title: "Cliente — Zelo Clinic" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;
  return <FamilyMemberDetailClient id={id} />;
}
