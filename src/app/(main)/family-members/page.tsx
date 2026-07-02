import { Suspense } from "react";
import { FamilyMembersListClient } from "@/features/family-members";

export const metadata = { title: "Clientes — Zelo Clinic" };

export default function FamilyMembersPage() {
  return (
    <Suspense>
      <FamilyMembersListClient />
    </Suspense>
  );
}
