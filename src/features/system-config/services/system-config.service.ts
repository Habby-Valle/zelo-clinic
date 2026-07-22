import { apiFetchClient } from "@/lib/api-client";

export interface SystemConfigPublic {
  is_maintenance: boolean;
  maintenance_message: string | null;
  maintenance_planned_end: string | null;
  plans_enabled: boolean;
  feedback_visible: boolean;
  support_email: string;
  support_phone: string | null;
  support_whatsapp: string | null;
}

export async function fetchSystemConfigPublic(): Promise<SystemConfigPublic> {
  return apiFetchClient<SystemConfigPublic>("/public/system/");
}
