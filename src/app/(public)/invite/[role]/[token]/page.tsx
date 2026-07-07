"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Smartphone } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const APP_SCHEME = "zeloapp";
const VALID_ROLES = ["caregiver", "family"] as const;

type Role = (typeof VALID_ROLES)[number];

const ROLE_LABEL: Record<Role, string> = {
  caregiver: "cuidador",
  family: "familiar",
};

export default function InviteRedirectPage() {
  const params = useParams<{ role: string; token: string }>();

  const role = params.role as Role;
  const token = params.token;
  const isValidRole = VALID_ROLES.includes(role);

  const deepLink = useMemo(
    () => `${APP_SCHEME}://invite/${role}/${token}`,
    [role, token],
  );

  // Tenta abrir o app automaticamente ao carregar. Muitos navegadores móveis
  // bloqueiam a abertura de esquema custom sem um toque do usuário, por isso
  // também exibimos o botão "Abrir no app" abaixo como fallback.
  useEffect(() => {
    if (!isValidRole || !token) return;
    window.location.href = deepLink;
  }, [deepLink, isValidRole, token]);

  if (!isValidRole) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <h1 className="text-xl font-semibold">Convite inválido</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Este link de convite não é válido. Verifique se você abriu o link
          correto recebido por e-mail.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-12 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Smartphone className="h-8 w-8 text-primary" />
      </div>

      <h1 className="text-xl font-semibold">Abrindo o aplicativo Zelo</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Você foi convidado como <strong>{ROLE_LABEL[role]}</strong>. Toque no
        botão abaixo para concluir seu cadastro no app Zelo.
      </p>

      <a
        href={deepLink}
        className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}
      >
        Abrir no app
      </a>

      <p className="mt-6 text-xs text-muted-foreground">
        O app não abriu? Verifique se o aplicativo Zelo está instalado no seu
        celular e toque novamente em <strong>Abrir no app</strong>.
      </p>
    </div>
  );
}
