"use client";

import * as React from "react";
import { ParcelType, ServiceType } from "@prisma/client";
import { motion } from "framer-motion";
import { FileText, Box, Dumbbell, Zap, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { volumetricWeightKg } from "@/lib/rate-engine";
import {
  defaultService,
  defaultWeightForParcelType,
  useBookingStore,
} from "@/store/useBookingStore";

export function Step3Parcel() {
  const { shipmentType, parcelType, serviceType, patch, setStep } =
    useBookingStore();
  const [pt, setPt] = React.useState<ParcelType | null>(parcelType);
  const [st, setSt] = React.useState<ServiceType | null>(
    serviceType ?? defaultService(shipmentType),
  );
  const [weight, setWeight] = React.useState(useBookingStore.getState().weight);
  const [length, setLength] = React.useState(
    useBookingStore.getState().length ?? 20,
  );
  const [breadth, setBreadth] = React.useState(
    useBookingStore.getState().breadth ?? 20,
  );
  const [height, setHeight] = React.useState(
    useBookingStore.getState().height ?? 20,
  );
  const [declared, setDeclared] = React.useState(
    useBookingStore.getState().declaredValue,
  );

  React.useEffect(() => {
    if (shipmentType === "INTERNATIONAL") {
      setSt("EXPRESS");
    }
  }, [shipmentType]);

  const vol =
    pt && pt !== "DOCUMENT" && length && breadth && height
      ? volumetricWeightKg(length, breadth, height)
      : 0;
  const chargeable =
    pt === "DOCUMENT" || !pt
      ? weight
      : Math.max(weight, vol);

  function validate(): boolean {
    if (!pt || !st) return false;
    if (pt === "DOCUMENT") {
      if (weight > 0.5 || weight < 0.1) return false;
    }
    if (pt === "PARCEL") {
      if (weight < 0.5 || weight > 30) return false;
    }
    if (pt === "HEAVY") {
      if (weight < 30 || weight > 70) return false;
    }
    return true;
  }

  function onNext() {
    if (!pt || !st) return;
    if (!validate()) return;
    patch({
      parcelType: pt,
      serviceType: st,
      weight,
      length: pt === "DOCUMENT" ? null : length,
      breadth: pt === "DOCUMENT" ? null : breadth,
      height: pt === "DOCUMENT" ? null : height,
      declaredValue: declared,
      chargeableWeightKg: chargeable,
    });
    setStep(4);
  }

  React.useEffect(() => {
    if (pt) setWeight(defaultWeightForParcelType(pt));
  }, [pt]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {(
          [
            {
              key: "DOCUMENT" as const,
              title: "Document",
              sub: "Up to 0.5kg",
              icon: FileText,
            },
            {
              key: "PARCEL" as const,
              title: "Parcel",
              sub: "0.5–30kg",
              icon: Box,
            },
            {
              key: "HEAVY" as const,
              title: "Heavy",
              sub: "30–70kg",
              icon: Dumbbell,
            },
          ] as const
        ).map((c) => (
          <motion.button
            key={c.key}
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              setPt(c.key);
              setWeight(defaultWeightForParcelType(c.key));
            }}
            className={cn(
              "rounded-lg border bg-white p-4 text-left shadow-card",
              pt === c.key
                ? "border-[#CC2027] ring-2 ring-[#CC2027]/20"
                : "border-[#E5E7EB]",
            )}
          >
            <c.icon className="mb-2 h-6 w-6 text-[#CC2027]" />
            <div className="font-semibold">{c.title}</div>
            <p className="text-xs text-[#6B7280]">{c.sub}</p>
          </motion.button>
        ))}
      </div>

      {pt && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="mb-2 block">Weight (kg)</Label>
            <Input
              type="number"
              step={pt === "DOCUMENT" ? "0.1" : "0.5"}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
            {pt === "DOCUMENT" && (
              <p className="mt-1 text-xs text-[#6B7280]">Max 0.5 kg</p>
            )}
          </div>
          <div>
            <Label className="mb-2 block">Declared value (₹)</Label>
            <Input
              type="number"
              value={declared}
              onChange={(e) => setDeclared(Number(e.target.value))}
            />
          </div>
          {pt !== "DOCUMENT" && (
            <>
              <div>
                <Label className="mb-2 block">Length (cm)</Label>
                <Input
                  type="number"
                  value={length ?? ""}
                  onChange={(e) => setLength(Number(e.target.value))}
                />
              </div>
              <div>
                <Label className="mb-2 block">Breadth (cm)</Label>
                <Input
                  type="number"
                  value={breadth ?? ""}
                  onChange={(e) => setBreadth(Number(e.target.value))}
                />
              </div>
              <div>
                <Label className="mb-2 block">Height (cm)</Label>
                <Input
                  type="number"
                  value={height ?? ""}
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
              </div>
              <div className="md:col-span-2 rounded-md border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm text-[#374151]">
                <p>
                  Volumetric weight:{" "}
                  <strong>{vol.toFixed(2)} kg</strong>
                </p>
                <p>
                  Chargeable weight:{" "}
                  <strong>{chargeable.toFixed(2)} kg</strong>
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <div>
        <h3 className="mb-3 font-heading text-lg font-semibold">Service</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <motion.button
            type="button"
            disabled={shipmentType === "INTERNATIONAL"}
            onClick={() => setSt("STANDARD")}
            className={cn(
              "rounded-lg border bg-white p-4 text-left shadow-card disabled:opacity-50",
              st === "STANDARD"
                ? "border-[#CC2027] ring-2 ring-[#CC2027]/20"
                : "border-[#E5E7EB]",
            )}
          >
            <div className="flex items-center gap-2 font-semibold">
              <Zap className="h-5 w-5 text-[#CC2027]" />
              Standard
            </div>
            <p className="mt-1 text-xs text-[#6B7280]">5–7 business days</p>
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setSt("EXPRESS")}
            className={cn(
              "rounded-lg border bg-white p-4 text-left shadow-card",
              st === "EXPRESS"
                ? "border-[#CC2027] ring-2 ring-[#CC2027]/20"
                : "border-[#E5E7EB]",
            )}
          >
            <div className="flex items-center gap-2 font-semibold">
              <Rocket className="h-5 w-5 text-[#CC2027]" />
              Express
            </div>
            <p className="mt-1 text-xs text-[#6B7280]">2–3 business days</p>
          </motion.button>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button
          type="button"
          disabled={!pt || !st || !validate()}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
