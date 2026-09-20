import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

// useSearchParams() needs a Suspense boundary, so the interactive dashboard lives in its
// own client component (same pattern as the Settings and Data Export admin pages).
const AdminDashboardPage = () => {
  return (
    <Suspense fallback={null}>
      <DashboardClient />
    </Suspense>
  );
};

export default AdminDashboardPage;
