import { z } from "zod";

export const registerClinicAdminStep1Schema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    phone: z.string().min(10, "Telefone inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Senhas não coincidem",
    path: ["confirm_password"],
  });

export const registerClinicAdminStep2Schema = z.object({
  clinic_name: z.string().min(2, "Nome da clínica deve ter pelo menos 2 caracteres"),
  clinic_document: z.string().min(14, "CNPJ inválido"),
  clinic_phone: z.string().min(10, "Telefone da clínica inválido"),
});

export type RegisterClinicAdminStep1Values = z.infer<typeof registerClinicAdminStep1Schema>;
export type RegisterClinicAdminStep2Values = z.infer<typeof registerClinicAdminStep2Schema>;
