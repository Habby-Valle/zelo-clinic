"use client";

import { useState, useCallback } from "react";

export function useTour(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const next = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const previous = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const skip = useCallback(() => {
    setIsOpen(false);
    setCurrentStep(0);
  }, []);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const finish = useCallback(() => {
    setIsOpen(false);
    setCurrentStep(0);
  }, []);

  return {
    currentStep,
    isOpen,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
    next,
    previous,
    skip,
    start,
    finish,
    setIsOpen,
  };
}
