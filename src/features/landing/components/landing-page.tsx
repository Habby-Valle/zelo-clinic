import { getPublicPlans } from "@/features/landing/services";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { LandingHero } from "@/features/landing/components/landing-hero";
import { LandingFeatures } from "@/features/landing/components/landing-features";
import { LandingPricing } from "@/features/landing/components/landing-pricing";
import { LandingContact } from "@/features/landing/components/landing-contact";
import { LandingFaq } from "@/features/landing/components/landing-faq";
import { LandingFooter } from "@/features/landing/components/landing-footer";

export async function LandingPage() {
  const plans = await getPublicPlans().catch(() => []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingPricing plans={plans} />
        <LandingContact />
        <LandingFaq />
      </main>
      <LandingFooter />
    </div>
  );
}
