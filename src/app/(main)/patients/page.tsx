import { Suspense } from "react";
import { PatientsClient } from "@/features/patients";

export default function PatientsPage() {
  return (
    <Suspense>
      <PatientsClient />
    </Suspense>
  );
}
