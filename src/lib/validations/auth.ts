import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

export type LoginSchema = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .min(1, "Código obrigatório")
    .length(6, "Código deve ter 6 dígitos")
    .regex(/^\d{6}$/, "Código deve conter apenas números"),
})

export type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
