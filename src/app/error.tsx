"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Erro não capturado:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="Zelo" width={40} height={40} className="h-10 w-auto" />
        <span className="text-2xl font-bold text-foreground">Zelo</span>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <div className="rounded-full bg-muted p-4">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="mt-2 text-xl font-semibold text-foreground">
          Algo deu errado
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.
        </p>
      </div>

      <Button onClick={reset}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  );
}
