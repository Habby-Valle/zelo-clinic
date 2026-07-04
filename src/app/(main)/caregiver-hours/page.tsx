import { CaregiverHoursClient } from "@/features/caregiver-hours/components";

export const metadata = { title: "Horas dos Cuidadores — Zelo Clinic" };

export default function CaregiverHoursPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Horas dos Cuidadores</h1>
        <p className="mt-1 text-muted-foreground">
          Acompanhamento de horas trabalhadas por cuidador.
        </p>
      </div>
      <CaregiverHoursClient />
    </div>
  );
}
