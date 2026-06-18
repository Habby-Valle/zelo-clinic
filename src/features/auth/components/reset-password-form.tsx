"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"

import { resetPasswordSchema, type ResetPasswordSchema } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({ resolver: zodResolver(resetPasswordSchema) })

  async function onSubmit(data: ResetPasswordSchema) {
    setServerError(null)
    if (!token) {
      setServerError("Link inválido ou expirado. Solicite um novo código.")
      return
    }
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Erro ao redefinir senha")
      }
      setIsSuccess(true)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Ocorreu um erro ao redefinir a senha.")
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Senha redefinida!
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sua senha foi alterada com sucesso.
          </p>
        </div>
        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            <AlertDescription>Você já pode fazer login com sua nova senha.</AlertDescription>
          </Alert>
          <Button
            onClick={() => router.push("/login")}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Ir para login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Nova senha
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Crie uma senha segura para sua conta.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="password">Nova senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={!!errors.password}
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={!!errors.confirmPassword}
              className="pr-10"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600"
              aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
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
              Redefinindo…
            </>
          ) : (
            "Redefinir senha"
          )}
        </Button>
      </form>
    </div>
  )
}
