import { NextResponse } from "next/server";
import {
  calculateRate,
  volumetricWeightKg,
} from "@/lib/rate-engine";
import { ratesCalculateSchema } from "@/lib/validators/shipment";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = ratesCalculateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const d = parsed.data;
  let chargeableWeightKg = d.weightKg;
  if (
    d.parcelType !== "DOCUMENT" &&
    d.lengthCm &&
    d.breadthCm &&
    d.heightCm
  ) {
    const vol = volumetricWeightKg(d.lengthCm, d.breadthCm, d.heightCm);
    chargeableWeightKg = Math.max(d.weightKg, vol);
  }
  const rate = calculateRate({
    shipmentType: d.shipmentType,
    parcelType: d.parcelType,
    serviceType: d.serviceType,
    chargeableWeightKg,
    originCity: d.originCity,
    destCity: d.destCity,
  });
  return NextResponse.json({
    baseCharge: rate.baseCharge,
    fuelSurcharge: rate.fuelSurcharge,
    gstAmount: rate.gstAmount,
    totalAmount: rate.totalAmount,
    chargeableWeightKg,
    estimatedDeliveryStart: rate.estimatedDeliveryStart.toISOString(),
    estimatedDeliveryEnd: rate.estimatedDeliveryEnd.toISOString(),
  });
}
