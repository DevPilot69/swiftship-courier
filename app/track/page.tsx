import { Suspense } from "react";
import { TrackPageClient } from "./TrackPageClient";

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F7F7] p-8 text-center text-sm text-[#6B7280]">
          Loading…
        </div>
      }
    >
      <TrackPageClient />
    </Suspense>
  );
}
