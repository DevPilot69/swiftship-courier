"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingStore } from "@/store/useBookingStore";
import type { BookingWizardState } from "@/types";

function buildVerifyPayload(
  s: BookingWizardState,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
) {
  return {
    shipmentType: s.shipmentType,
    senderName: s.senderName,
    senderPhone: s.senderPhone,
    senderEmail: s.senderEmail,
    originPincode: s.originPincode,
    originCity: s.originCity,
    originState: s.originState,
    senderAddress: s.senderAddress,
    receiverName: s.receiverName,
    receiverPhone: s.receiverPhone,
    receiverEmail: s.receiverEmail,
    destPincode: s.destPincode,
    destCity: s.destCity,
    destState: s.destState,
    destCountry: s.destCountry,
    receiverAddress: s.receiverAddress,
    parcelType: s.parcelType,
    weight: s.weight,
    length: s.length,
    breadth: s.breadth,
    height: s.height,
    declaredValue: s.declaredValue,
    serviceType: s.serviceType,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  };
}

async function verifyAndFinish(
  payload: ReturnType<typeof buildVerifyPayload>,
): Promise<{ ok: boolean; awb?: string; error?: string }> {
  const v = await fetch("/api/payments/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const j = await v.json().catch(() => ({}));
  if (!v.ok) {
    return { ok: false, error: typeof j.error === "string" ? j.error : "Verification failed" };
  }
  return { ok: true, awb: typeof j.awb === "string" ? j.awb : undefined };
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function Step5Payment() {
  const router = useRouter();
  const s = useBookingStore();
  const [busy, setBusy] = React.useState(false);

  const fmt = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  async function pay() {
    if (!s.rateBreakdown) {
      toast.error("Rate not ready");
      return;
    }
    setBusy(true);
    const amountPaise = Math.round(s.rateBreakdown.totalAmount * 100);
    const orderRes = await fetch("/api/payments/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountPaise }),
    });
    const orderJson = await orderRes.json().catch(() => ({}));
    if (!orderRes.ok) {
      toast.error(orderJson.error ?? "Could not create order");
      setBusy(false);
      return;
    }

    if (orderJson.demo === true) {
      const demoPaymentId = `demo_pay_${crypto.randomUUID()}`;
      const payload = buildVerifyPayload(
        s,
        orderJson.orderId as string,
        demoPaymentId,
        "demo",
      );
      const result = await verifyAndFinish(payload);
      if (!result.ok || !result.awb) {
        toast.error(result.error ?? "Could not complete booking");
        setBusy(false);
        return;
      }
      toast.success(`Shipment booked! AWB: ${result.awb}`);
      useBookingStore.getState().reset();
      router.push("/dashboard/orders");
      setBusy(false);
      return;
    }

    const ready = await loadRazorpay();
    if (!ready || !window.Razorpay) {
      toast.error("Could not load payment gateway");
      setBusy(false);
      return;
    }

    const key =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? orderJson.key ?? "";
    const rzp = new window.Razorpay({
      key,
      amount: amountPaise,
      currency: "INR",
      name: "SwiftShip",
      description: "Shipment booking",
      order_id: orderJson.orderId,
      prefill: {
        name: s.senderName,
        email: s.senderEmail,
        contact: s.senderPhone,
      },
      theme: { color: "#CC2027" },
      handler: async (response) => {
        const payload = buildVerifyPayload(
          s,
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature,
        );
        const result = await verifyAndFinish(payload);
        if (!result.ok || !result.awb) {
          toast.error(result.error ?? "Payment verification failed");
          setBusy(false);
          return;
        }
        toast.success(`Shipment booked! AWB: ${result.awb}`);
        useBookingStore.getState().reset();
        router.push("/dashboard/orders");
      },
      modal: {
        ondismiss: () => setBusy(false),
      },
    });
    rzp.open();
    setBusy(false);
  }

  const demoUi =
    process.env.NEXT_PUBLIC_DEMO_PAYMENTS === "true";

  return (
    <div className="space-y-6">
      {demoUi && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Demo mode: payment is simulated. Unique demo order and payment IDs are
          generated; Razorpay is not used.
        </p>
      )}
      {s.rateBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Route</span>
              <span>
                {s.originCity} → {s.destCity}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Service</span>
              <span>{s.serviceType}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Amount due</span>
              <span>{fmt.format(s.rateBreakdown.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="flex justify-between gap-4">
        <Button type="button" variant="outline" onClick={() => s.setStep(4)}>
          Back
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={busy || !s.rateBreakdown}
          onClick={pay}
        >
          {demoUi ? "Complete booking (demo)" : "Pay"}{" "}
          {s.rateBreakdown ? fmt.format(s.rateBreakdown.totalAmount) : ""}
        </Button>
      </div>
    </div>
  );
}
