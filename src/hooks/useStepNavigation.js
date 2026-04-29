"use client";

import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";

export function useStepNavigation() {
  const router = useRouter();
  const { data, update } = useDonation();

  const handleNext = (nextStep) => {
    const targetStep = typeof nextStep === "number" ? nextStep : (data.maxStep ?? 1) + 1;
    update({ maxStep: Math.max(data.maxStep ?? 1, targetStep) });
    router.push(`/donate/${targetStep}`);
  };

  const handlePrev = (prevStep) => {
    router.push(`/donate/${prevStep}`);
  };

  return { handleNext, handlePrev };
}