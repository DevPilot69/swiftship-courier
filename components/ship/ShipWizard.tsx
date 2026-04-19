"use client";

import type { User } from "next-auth";
import { WizardProgress } from "@/components/ship/WizardProgress";
import { Step1RouteType } from "@/components/ship/steps/Step1RouteType";
import { Step2Locations } from "@/components/ship/steps/Step2Locations";
import { Step3Parcel } from "@/components/ship/steps/Step3Parcel";
import { Step4RateResult } from "@/components/ship/steps/Step4RateResult";
import { Step5Payment } from "@/components/ship/steps/Step5Payment";
import { useBookingStore } from "@/store/useBookingStore";

export function ShipWizard({ user }: { user: User }) {
  const step = useBookingStore((s) => s.step);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 font-heading text-2xl font-bold text-[#1A1A1A]">
        Book a shipment
      </h1>
      <p className="mb-8 text-sm text-[#6B7280]">
        Complete the steps in order to book and pay online.
      </p>
      <WizardProgress step={step} />
      {step === 1 && <Step1RouteType />}
      {step === 2 && <Step2Locations user={user} />}
      {step === 3 && <Step3Parcel />}
      {step === 4 && <Step4RateResult />}
      {step === 5 && <Step5Payment />}
    </div>
  );
}
