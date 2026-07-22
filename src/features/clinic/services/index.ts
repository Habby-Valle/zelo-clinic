import { apiFetchClient } from "@/lib/api-client";
import type { Clinic } from "@/features/clinic/types";

export async function getClinic(): Promise<Clinic> {
  return apiFetchClient<Clinic>("/clinics/me/");
}

export interface UpdateClinicData {
  phone?: string;
  document?: string;
  media_id?: string | null;
  theme_color?: string | null;
  email?: string;
  website?: string;
  description?: string;
  responsible_name?: string;
  whatsapp?: string;
  business_hours?: Record<string, unknown>;
  social_media?: Record<string, unknown>;
  cnes?: string;
  specialty?: string;
  onboarding_completed?: boolean;
  daily_report_enabled?: boolean;
  visit_notification_enabled?: boolean;
  satisfaction_survey_enabled?: boolean;
  address?: {
    zip_code?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
  } | null;
}

export async function updateClinicApi(data: UpdateClinicData): Promise<Clinic> {
  return apiFetchClient<Clinic>("/clinics/me/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
