import { Suspense } from "react";
import { CaregiversClient } from "@/features/caregivers";

export default function UsersPage() {
  return (
    <Suspense>
      <CaregiversClient />
    </Suspense>
  );
}
