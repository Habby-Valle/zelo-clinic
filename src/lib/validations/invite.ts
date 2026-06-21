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

export const registerClinicAdminStep3Schema = z.object({
  zip_code: z.string().min(8, "CEP inválido"),
  street: z.string().min(2, "Logradouro obrigatório"),
  number: z.string().min(1, "Número obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "UF deve ter 2 caracteres"),
});

export type RegisterClinicAdminStep1Values = z.infer<typeof registerClinicAdminStep1Schema>;
export type RegisterClinicAdminStep2Values = z.infer<typeof registerClinicAdminStep2Schema>;
export type RegisterClinicAdminStep3Values = z.infer<typeof registerClinicAdminStep3Schema>;
