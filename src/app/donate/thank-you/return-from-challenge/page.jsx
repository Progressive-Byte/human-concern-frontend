import { Suspense } from "react";
import ReturnChallengeClient from "./ReturnChallengeClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center text-[#737373]">
          Loading…
        </div>
      }
    >
      <ReturnChallengeClient />
    </Suspense>
  );
}
