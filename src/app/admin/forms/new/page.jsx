import { Suspense } from "react";
import WizardPageClient from "./WizardPageClient";

export default function AdminCreateFormWizardPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-6 text-sm text-[#6B7280]">Loading…</div>}>
      <WizardPageClient />
    </Suspense>
  );
}
