import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NurseDetailClient } from "@/features/caregivers";

export const metadata = { title: "Enfermeiro — Zelo Clinic" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NurseDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/users" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Enfermeiro</h1>
          <p className="mt-1 text-sm text-muted-foreground">Detalhes do enfermeiro.</p>
        </div>
      </div>

      <NurseDetailClient nurseId={id} />
    </div>
  );
}
