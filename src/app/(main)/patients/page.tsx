import { Suspense } from "react";
import { PatientsClient } from "@/features/patients";
import { requireClinicUser } from "@/lib/auth";

export const metadata = { title: "Pacientes — Zelo Clinic" };

export default async function PatientsPage() {
  const { user } = await requireClinicUser();

  return (
    <Suspense>
      <PatientsClient role={user.role} />
    </Suspense>
  );
}
