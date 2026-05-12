import { Suspense } from "react";
import SettingsPageClient from "./SettingsPageClient";

export default function AdminSettingsPage() {
  return (
    <Suspense>
      <SettingsPageClient />
    </Suspense>
  );
}
