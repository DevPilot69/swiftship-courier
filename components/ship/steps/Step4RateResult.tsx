"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingStore } from "@/store/useBookingStore";

export function Step4RateResult() {
  const s = useBookingStore();
  const { setStep, patch } = s;
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (s.rateBreakdown) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      if (
        !s.shipmentType ||
        !s.parcelType ||
        !s.serviceType ||
        !s.originCity ||
        !s.destCity
      ) {
        setErr("Incomplete booking details");
        setLoading(false);
        return;
      }
      const body = {
        shipmentType: s.shipmentType,
        parcelType: s.parcelType,
        serviceType: s.serviceType,
        weightKg: s.chargeableWeightKg,
        lengthCm: s.length ?? undefined,
        breadthCm: s.breadth ?? undefined,
        heightCm: s.height ?? undefined,
        originCity: s.originCity,
        destCity: s.destCity,
      };
      const r = await fetch("/api/rates/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      if (cancelled) return;
      if (!r.ok) {
        setErr("Could not calculate rate");
        setLoading(false);
        return;
      }
      patch({
        rateBreakdown: {
          baseCharge: j.baseCharge,
          fuelSurcharge: j.fuelSurcharge,
          gstAmount: j.gstAmount,
          totalAmount: j.totalAmount,
          estimatedDeliveryStart: j.estimatedDeliveryStart,
          estimatedDeliveryEnd: j.estimatedDeliveryEnd,
        },
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    patch,
    s.rateBreakdown,
    s.shipmentType,
    s.parcelType,
    s.serviceType,
    s.chargeableWeightKg,
    s.length,
    s.breadth,
    s.height,
    s.originCity,
    s.destCity,
  ]);

  const fmt = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const rb = s.rateBreakdown;

  return (
    <div className="space-y-6">
      {loading && <p className="text-sm text-[#6B7280]">Calculating…</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      {rb && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Price breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Base charge</span>
                <span>{fmt.format(rb.baseCharge)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Fuel surcharge (5%)</span>
                <span>{fmt.format(rb.fuelSurcharge)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">GST (18%)</span>
                <span>{fmt.format(rb.gstAmount)}</span>
              </div>
              <div className="border-t border-[#E5E7EB] pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>{fmt.format(rb.totalAmount)}</span>
              </div>
              <p className="pt-2 text-[#6B7280]">
                Route: {s.originCity} → {s.destCity}
              </p>
              <p className="text-[#6B7280]">
                Service: {s.serviceType} · Weight: {s.chargeableWeightKg.toFixed(2)}{" "}
                kg
              </p>
              <p className="text-[#6B7280]">
                Est. delivery:{" "}
                {new Date(rb.estimatedDeliveryStart).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                –{" "}
                {new Date(rb.estimatedDeliveryEnd).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep(3)}>
          Change details
        </Button>
        <Button
          type="button"
          disabled={!rb}
          onClick={() => setStep(5)}
        >
          Proceed to pay
        </Button>
      </div>
    </div>
  );
}
