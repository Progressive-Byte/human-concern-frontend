import { Suspense } from "react";
import FormsPageClient from "./FormsPageClient";

export default function AdminFormsPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-6 text-sm text-[#6B7280]">Loading…</div>}>
      <FormsPageClient />
    </Suspense>
  );
}
