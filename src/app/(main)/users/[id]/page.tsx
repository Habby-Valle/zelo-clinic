import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CaregiverDocumentsCard } from "@/features/caregiver-documents";
import { CaregiverVerificationCard } from "@/features/caregivers";

export const metadata = { title: "Cuidador — Zelo Clinic" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/users" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cuidador</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie os documentos do cuidador.</p>
        </div>
      </div>

      <CaregiverVerificationCard caregiverId={id} />

      <CaregiverDocumentsCard caregiverId={id} />
    </div>
  );
}
