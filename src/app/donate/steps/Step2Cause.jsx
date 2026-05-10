"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDonation } from "@/context/DonationContext";

// Causes are now handled inside Step1Info. Redirect anyone who lands here.
const Step2Cause = () => {
  const { data } = useDonation();
  const router   = useRouter();

  useEffect(() => {
    const base = data.campaign ? `/${data.campaign}` : "/donate";
    router.replace(`${base}/4`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Step2Cause;
