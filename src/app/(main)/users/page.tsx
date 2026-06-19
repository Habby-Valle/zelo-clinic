import { Suspense } from "react";
import { CaregiversClient } from "@/features/caregivers";

export const metadata = { title: "Cuidadores — Zelo Clinic" };

export default function UsersPage() {
  return (
    <Suspense>
      <CaregiversClient />
    </Suspense>
  );
}
