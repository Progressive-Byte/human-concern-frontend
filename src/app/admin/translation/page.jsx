import { Suspense } from "react";
import TranslationPageClient from "./TranslationPageClient";

const AdminTranslationPage = () => {
  return (
    <Suspense>
      <TranslationPageClient />
    </Suspense>
  );
};

export default AdminTranslationPage;
