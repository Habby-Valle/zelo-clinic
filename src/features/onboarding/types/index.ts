export interface RoleOnboardingStats {
  role: string;
  total_profiles: number;
  total_steps: number;
  completed_steps: number;
  pending_steps: number;
}

export type ClinicOnboardingStats = RoleOnboardingStats[];

export interface TourStep {
  id: string;
  icon: string;
  title: string;
  description: string;
  details: string[];
}
