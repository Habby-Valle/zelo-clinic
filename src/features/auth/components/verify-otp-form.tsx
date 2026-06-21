"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseMedical, Loader2, KeyRound } from "lucide-react";
import Link from "next/link";

import { verifyOtpSchema, type VerifyOtpSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpSchema>({ resolver: zodResolver(verifyOtpSchema) });

  async function onSubmit(data: VerifyOtpSchema) {
    setServerError(null);
    if (!email) {
      setServerError("E-mail não encontrado. Solicite um novo código.");
      return;
    }
    try {
      const res = await fetch("/api/auth/password-reset/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: data.otp }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Código inválido ou expirado");
      }
      const { reset_token } = await res.json();
      router.push(`/reset-password?token=${encodeURIComponent(reset_token)}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Ocorreu um erro ao verificar o código.");
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <BriefcaseMedical className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Zelo
            </p>
            <p className="text-sm leading-none font-semibold">Clinic</p>
          </div>
        </div>

        <div>
          <CardTitle className="text-2xl">Verificar código</CardTitle>
          <CardDescription className="mt-1">
            Digite o código de 6 dígitos enviado para <strong>{email}</strong>.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="otp">Código de verificação</Label>
            <div className="relative">
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                autoComplete="one-time-code"
                disabled={isSubmitting}
                aria-invalid={!!errors.otp}
                className="text-center font-mono text-lg tracking-[0.5em]"
                {...register("otp")}
              />
              <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {errors.otp && <p className="text-xs text-destructive">{errors.otp.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando…
              </>
            ) : (
              "Verificar código"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Não recebeu o código?{" "}
            <Link
              href="/forgot-password"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Solicitar novo
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
