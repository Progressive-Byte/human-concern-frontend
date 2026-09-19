import { Suspense } from "react";
import DataExportPageClient from "./DataExportPageClient";

const AdminDataExportPage = () => {
  return (
    <Suspense>
      <DataExportPageClient />
    </Suspense>
  );
};

export default AdminDataExportPage;
