"use client";

import { motion } from "framer-motion";
import { Plane, MapPin } from "lucide-react";
import { ShipmentType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/store/useBookingStore";

export function Step1RouteType() {
  const { shipmentType, patch, setStep } = useBookingStore();

  function select(t: ShipmentType) {
    patch({
      shipmentType: t,
      serviceType: t === "INTERNATIONAL" ? "EXPRESS" : "STANDARD",
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => select("DOMESTIC")}
          className={cn(
            "rounded-lg border bg-white p-6 text-left shadow-card transition-colors",
            shipmentType === "DOMESTIC"
              ? "border-[#CC2027] ring-2 ring-[#CC2027]/20"
              : "border-[#E5E7EB]",
          )}
        >
          <div className="mb-2 flex items-center gap-2 text-lg font-semibold text-[#1A1A1A]">
            <MapPin className="h-5 w-5 text-[#CC2027]" />
            Domestic
          </div>
          <p className="text-sm text-[#6B7280]">Within India</p>
          <p className="mt-2 text-xs text-[#6B7280]">Standard &amp; Express</p>
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => select("INTERNATIONAL")}
          className={cn(
            "rounded-lg border bg-white p-6 text-left shadow-card transition-colors",
            shipmentType === "INTERNATIONAL"
              ? "border-[#CC2027] ring-2 ring-[#CC2027]/20"
              : "border-[#E5E7EB]",
          )}
        >
          <div className="mb-2 flex items-center gap-2 text-lg font-semibold text-[#1A1A1A]">
            <Plane className="h-5 w-5 text-[#CC2027]" />
            International
          </div>
          <p className="text-sm text-[#6B7280]">Outside India</p>
          <p className="mt-2 text-xs text-[#6B7280]">Express only</p>
        </motion.button>
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!shipmentType}
          onClick={() => setStep(2)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
