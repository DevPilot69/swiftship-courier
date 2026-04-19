import {
  ParcelType,
  ServiceType,
  ShipmentType,
} from "@prisma/client";

export type RateInput = {
  shipmentType: ShipmentType;
  parcelType: ParcelType;
  serviceType: ServiceType;
  chargeableWeightKg: number;
  originCity: string;
  destCity: string;
};

export type RateBreakdown = {
  baseCharge: number;
  fuelSurcharge: number;
  gstAmount: number;
  totalAmount: number;
  estimatedDeliveryStart: Date;
  estimatedDeliveryEnd: Date;
};

function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d;
}

function domesticBaseRate(
  parcelType: ParcelType,
  serviceType: ServiceType,
  weightKg: number,
): number {
  const w = weightKg;
  if (parcelType === "DOCUMENT") {
    if (serviceType === "STANDARD") {
      const base = 40;
      const extraGrams = Math.max(0, w * 1000 - 200);
      const blocks = Math.ceil(extraGrams / 100) || 0;
      return base + blocks * 10;
    }
    const base = 70;
    const extraGrams = Math.max(0, w * 1000 - 200);
    const blocks = Math.ceil(extraGrams / 100) || 0;
    return base + blocks * 15;
  }
  if (parcelType === "PARCEL") {
    if (serviceType === "STANDARD") {
      const base = 80;
      const extraGrams = Math.max(0, w * 1000 - 500);
      const blocks = Math.ceil(extraGrams / 500) || 0;
      return base + blocks * 20;
    }
    const base = 140;
    const extraGrams = Math.max(0, w * 1000 - 500);
    const blocks = Math.ceil(extraGrams / 500) || 0;
    return base + blocks * 30;
  }
  if (serviceType === "STANDARD") {
    const base = 300;
    const extraKg = Math.max(0, w - 30);
    return base + extraKg * 15;
  }
  const base = 500;
  const extraKg = Math.max(0, w - 30);
  return base + extraKg * 25;
}

export function calculateRate(input: RateInput): RateBreakdown {
  const domesticBase = domesticBaseRate(
    input.parcelType,
    input.serviceType,
    input.chargeableWeightKg,
  );
  const baseCharge =
    input.shipmentType === "INTERNATIONAL"
      ? Math.round(domesticBase * 4.5 * 100) / 100
      : Math.round(domesticBase * 100) / 100;

  const fuelSurcharge = Math.round(baseCharge * 0.05 * 100) / 100;
  const taxable = baseCharge + fuelSurcharge;
  const gstAmount = Math.round(taxable * 0.18 * 100) / 100;
  const totalAmount = Math.round((taxable + gstAmount) * 100) / 100;

  const now = new Date();
  let businessDaysMin: number;
  let businessDaysMax: number;

  if (input.shipmentType === "INTERNATIONAL") {
    businessDaysMin = 7;
    businessDaysMax = 7;
  } else if (input.serviceType === "EXPRESS") {
    businessDaysMin = 2;
    businessDaysMax = 2;
  } else {
    businessDaysMin = 5;
    businessDaysMax = 7;
  }

  const estimatedDeliveryStart = addBusinessDays(now, businessDaysMin);
  const estimatedDeliveryEnd = addBusinessDays(now, businessDaysMax);

  return {
    baseCharge,
    fuelSurcharge,
    gstAmount,
    totalAmount,
    estimatedDeliveryStart,
    estimatedDeliveryEnd,
  };
}

export function volumetricWeightKg(
  lengthCm: number,
  breadthCm: number,
  heightCm: number,
): number {
  return (lengthCm * breadthCm * heightCm) / 5000;
}
