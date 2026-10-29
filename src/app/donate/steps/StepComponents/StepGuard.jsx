"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";

// Stops a donor from opening a step by typing its link. They can only see a step
// they have already reached (maxStep). Anything further sends them back to the
// last step they unlocked. The step still renders during the first paint, because
// maxStep is only known on the client; the redirect happens right after mount.
const StepGuard = ({ step, campaignSlug, children }) => {
  const router = useRouter();
  const { data } = useDonation();
  const maxStep = Math.max(1, data.maxStep ?? 1);
  const base = campaignSlug
    ? `/${campaignSlug}`
    : data.campaign
    ? `/${data.campaign}`
    : "/donate";

  useEffect(() => {
    if (step > maxStep) router.replace(`${base}/${maxStep}`);
  }, [step, maxStep, base, router]);

  return children;
};

export default StepGuard;
