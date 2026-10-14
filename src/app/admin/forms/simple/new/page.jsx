import { Suspense } from "react";
import SimpleFormPageClient from "./SimpleFormPageClient";

const AdminSimpleFormPage = () => {
  return (
    <Suspense fallback={<div className="p-4 md:p-6 text-sm text-[#6B7280]">Loading…</div>}>
      <SimpleFormPageClient />
    </Suspense>
  );
}
export default AdminSimpleFormPage;
