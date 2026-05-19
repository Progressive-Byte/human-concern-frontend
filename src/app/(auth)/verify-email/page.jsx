import { Suspense } from "react";
import VerifyEmailClient from "./verify-email-client";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-sm text-white/70">Loading…</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}

