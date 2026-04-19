"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const labels = ["Route", "Locations", "Parcel", "Price", "Payment"];

export function WizardProgress({ step }: { step: number }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between gap-2">
        {labels.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                  done && "border-[#CC2027] bg-[#CC2027] text-white",
                  active && !done && "border-[#CC2027] bg-[#CC2027] text-white",
                  !active && !done && "border-[#E5E7EB] bg-white text-[#9CA3AF]",
                )}
              >
                {done ? <Check className="h-5 w-5" /> : n}
              </div>
              {i < labels.length - 1 && (
                <div
                  className={cn(
                    "hidden h-[2px] flex-1 sm:block",
                    step > n ? "bg-[#CC2027]" : "bg-[#E5E7EB]",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 hidden grid-cols-5 gap-2 text-center text-xs font-medium text-[#6B7280] sm:grid">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}
