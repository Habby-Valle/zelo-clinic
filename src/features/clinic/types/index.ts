export interface Address {
  zip_code: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
}

export interface Clinic {
  id: string;
  name: string;
  document: string;
  phone: string;
  address: Address | null;
  media_id: string | null;
  media_url: string | null;
  theme_color: string | null;
  email: string;
  website: string;
  description: string;
  responsible_name: string;
  whatsapp: string;
  business_hours: Record<string, unknown>;
  social_media: Record<string, unknown>;
  cnes: string;
  specialty: string;
  onboarding_completed: boolean;
  daily_report_enabled: boolean;
  visit_notification_enabled: boolean;
  satisfaction_survey_enabled: boolean;
}
