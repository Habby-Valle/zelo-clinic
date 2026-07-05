"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface OnboardingState {
  hasSeenWelcome: boolean;
  setHasSeenWelcome: () => void;
  tourRequested: boolean;
  requestTour: () => void;
  clearTourRequest: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasSeenWelcome: false,
      setHasSeenWelcome: () => set({ hasSeenWelcome: true }),
      tourRequested: false,
      requestTour: () => set({ tourRequested: true }),
      clearTourRequest: () => set({ tourRequested: false }),
    }),
    {
      name: "zelo-clinic-onboarding",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        hasSeenWelcome: state.hasSeenWelcome,
      }),
    }
  )
);
