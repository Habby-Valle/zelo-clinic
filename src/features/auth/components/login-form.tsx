"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"

import { useLogin } from "@/features/auth/hooks"
import { useAuthStore } from "@/store/authStore"
import { loginSchema, type LoginSchema } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const router = useRouter()
  const login = useLogin()
  const { setUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) })

  function onSubmit(data: LoginSchema) {
    login.mutate(
      { email: data.email, password: data.password },
      {
        onSuccess: ({ user }) => {
          setUser(user)
          router.push("/dashboard")
          router.refresh()
        },
      }
    )
  }

  const isPending = login.isPending || isSubmitting

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Bem-vindo de volta
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Acesse o painel da sua clínica.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {login.error && (
          <Alert variant="destructive">
            <AlertDescription>{login.error.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            disabled={isPending}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline underline-offset-4"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isPending}
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

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando…
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>
    </div>
  )
}
