"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import Link from "next/link"

import { verifyOtpSchema, type VerifyOtpSchema } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function VerifyOtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpSchema>({ resolver: zodResolver(verifyOtpSchema) })

  async function onSubmit(data: VerifyOtpSchema) {
    setServerError(null)
    if (!email) {
      setServerError("E-mail não encontrado. Solicite um novo código.")
      return
    }
    try {
      const res = await fetch("/api/auth/password-reset/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: data.otp }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Código inválido ou expirado")
      }
      const { reset_token } = await res.json()
      router.push(`/reset-password?token=${encodeURIComponent(reset_token)}`)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Ocorreu um erro ao verificar o código.")
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Verificar código
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Digite o código de 6 dígitos enviado para{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{email || "seu e-mail"}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="otp">Código de verificação</Label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            autoComplete="one-time-code"
            disabled={isSubmitting}
            aria-invalid={!!errors.otp}
            className="text-center font-mono text-xl tracking-[0.6em]"
            {...register("otp")}
          />
          {errors.otp && (
            <p className="text-xs text-destructive">{errors.otp.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando…
            </>
          ) : (
            "Verificar código"
          )}
        </Button>

        <p className="text-center text-sm text-zinc-500">
          Não recebeu o código?{" "}
          <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-4">
            Solicitar novo
          </Link>
        </p>
      </form>
    </div>
  )
}
