"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAsaasConfig } from "@/features/clinic/hooks/use-asaas-config";
import type { UserRole } from "@/types/common";

export function AsaasConfigBanner({ role }: { role: UserRole }) {
  const { data, isLoading, isError } = useAsaasConfig();

  // Apenas o admin da clínica configura o ASAAS. Enfermeiros não têm acesso
  // ao endpoint (403), então nem exibimos o aviso para eles.
  if (role !== "clinic_admin") return null;

  // Enquanto carrega ou em caso de erro, evitamos exibir um aviso incorreto.
  if (isLoading || isError) return null;

  // Já configurado — nada a fazer.
  if (data?.has_api_key) return null;

  return (
    <Alert variant="destructive" className="mb-6 border-destructive/40 bg-destructive/5">
      <AlertTriangle />
      <AlertTitle>Configure o ASAAS para receber pagamentos</AlertTitle>
      <AlertDescription>
        A integração com o ASAAS ainda não foi configurada. Sem ela, sua clínica não consegue
        emitir cobranças nem receber pagamentos.{" "}
        <Link href="/admin/settings?tab=pagamentos" className="font-medium">
          Configurar agora
        </Link>
        .
      </AlertDescription>
    </Alert>
  );
}
