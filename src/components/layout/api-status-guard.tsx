"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Activity, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApiStatusGuardProps {
  children: React.ReactNode;
}

export function ApiStatusGuard({ children }: ApiStatusGuardProps) {
  const [status, setStatus] = useState<"checking" | "ok" | "down">("checking");

  useEffect(() => {
    checkApi();
  }, []);

  async function checkApi() {
    setStatus("checking");
    try {
      const res = await fetch("/api/proxy/system-config/public/", {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        setStatus("ok");
      } else {
        setStatus("down");
      }
    } catch {
      setStatus("down");
    }
  }

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Activity className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  if (status === "down") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Zelo" width={40} height={40} className="h-10 w-auto" />
          <span className="text-2xl font-bold text-foreground">Zelo</span>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-muted p-4">
            <WifiOff className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="mt-2 text-xl font-semibold text-foreground">
            Serviço temporariamente indisponível
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Não foi possível conectar ao servidor. Tente novamente em alguns instantes.
          </p>
        </div>

        <Button onClick={checkApi}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
