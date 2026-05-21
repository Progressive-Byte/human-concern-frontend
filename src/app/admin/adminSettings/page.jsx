import { Suspense } from "react";
import SettingsPageClient from "./SettingsPageClient";

const AdminSettingsPage = () => {
  return (
    <Suspense>
      <SettingsPageClient />
    </Suspense>
  );
}
