import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  birth_date: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  gender: z.enum(["M", "F", "O"], { error: "Selecione o sexo" }),
  cpf: z.string().max(14).nullable().optional(),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("Email inválido").nullable().optional().or(z.literal("")),
  blood_type: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).nullable().optional(),
  health_conditions: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  observations: z.string().optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
