import { Suspense } from "react";
import VerifyEmailClient from "./verify-email-client";

const VerifyEmailPage = () => {
  return (
    <Suspense fallback={<div className="text-sm text-white/70">Loading…</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}

export default VerifyEmailPage;
