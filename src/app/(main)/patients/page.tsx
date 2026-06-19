import { Suspense } from "react";
import { PatientsClient } from "@/features/patients";

export const metadata = { title: "Pacientes — Zelo Clinic" };

export default function PatientsPage() {
  return (
    <Suspense>
      <PatientsClient />
    </Suspense>
  );
}
