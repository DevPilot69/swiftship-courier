import {
  ParcelType,
  ServiceType,
  ShipmentType,
} from "@prisma/client";
import { create } from "zustand";
import type { BookingWizardState } from "@/types";

const initial: BookingWizardState = {
  shipmentType: null,
  serviceType: null,
  parcelType: null,
  senderName: "",
  senderPhone: "",
  senderEmail: "",
  originPincode: "",
  originCity: "",
  originState: "",
  senderAddress: "",
  receiverName: "",
  receiverPhone: "",
  receiverEmail: "",
  destPincode: "",
  destCity: "",
  destState: "",
  destCountry: "India",
  receiverAddress: "",
  weight: 0.5,
  length: null,
  breadth: null,
  height: null,
  declaredValue: 500,
  chargeableWeightKg: 0.5,
  rateBreakdown: null,
  razorpayOrderId: null,
};

type Store = BookingWizardState & {
  step: number;
  setStep: (n: number) => void;
  patch: (p: Partial<BookingWizardState>) => void;
  reset: () => void;
};

export const useBookingStore = create<Store>((set) => ({
  ...initial,
  step: 1,
  setStep: (n) => set({ step: n }),
  patch: (p) => set((s) => ({ ...s, ...p })),
  reset: () => set({ ...initial, step: 1 }),
}));

export function parcelLabelForParcelType(p: ParcelType): string {
  switch (p) {
    case "DOCUMENT":
      return "DOCUMENT";
    case "PARCEL":
      return "PARCEL";
    case "HEAVY":
      return "HEAVY";
    default:
      return "PARCEL";
  }
}

export function defaultWeightForParcelType(p: ParcelType): number {
  switch (p) {
    case "DOCUMENT":
      return 0.2;
    case "PARCEL":
      return 1;
    case "HEAVY":
      return 35;
    default:
      return 1;
  }
}

export function defaultService(
  shipmentType: ShipmentType | null,
): ServiceType {
  if (shipmentType === "INTERNATIONAL") return "EXPRESS";
  return "STANDARD";
}
