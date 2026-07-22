"use client";

import { useOnboardingStore } from "@/store/onboardingStore";
import { useCurrentUser } from "@/hooks/use-current-user";
import { WelcomeDialog } from "./welcome-dialog";
import { TourDialog } from "./tour-dialog";

export function OnboardingWrapper() {
  const { user, hasHydrated } = useCurrentUser();
  const { hasSeenWelcome, setHasSeenWelcome, tourRequested, clearTourRequest, requestTour } =
    useOnboardingStore();

  const showWelcome = hasHydrated && user?.role === "clinic_admin" && !hasSeenWelcome;
  const showTour = hasHydrated && user?.role === "clinic_admin" && tourRequested;

  function handleStartTour() {
    setHasSeenWelcome();
    requestTour();
  }

  function handleSkipWelcome() {
    setHasSeenWelcome();
  }

  function handleCloseTour() {
    clearTourRequest();
  }

  if (!hasHydrated || user?.role !== "clinic_admin") return null;

  return (
    <>
      <WelcomeDialog
        open={showWelcome}
        onOpenChange={(open) => {
          if (!open) handleSkipWelcome();
        }}
        onStartTour={handleStartTour}
      />
      <TourDialog
        open={showTour}
        onOpenChange={(open) => {
          if (!open) handleCloseTour();
        }}
      />
    </>
  );
}
