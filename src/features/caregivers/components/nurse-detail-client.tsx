"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCaregiver } from "../hooks";

interface Props {
  nurseId: string;
}

export function NurseDetailClient({ nurseId }: Props) {
  const { data: nurse, isLoading } = useCaregiver(nurseId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!nurse) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{nurse.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Email</span>
            <p className="text-sm">{nurse.email}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Telefone</span>
            <p className="text-sm">{nurse.phone || "—"}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Registro profissional</span>
            <p className="text-sm">{nurse.professional_register || "—"}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-muted-foreground">Status</span>
            <p>
              {nurse.is_active ? (
                <Badge variant="secondary">Ativo</Badge>
              ) : (
                <Badge variant="outline">Inativo</Badge>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
