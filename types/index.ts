import type {
  ParcelType,
  ServiceType,
  Shipment,
  ShipmentStatus,
  ShipmentType,
  TrackingEvent,
} from "@prisma/client";

export type ShipmentWithEvents = Shipment & {
  trackingEvents: TrackingEvent[];
};

export type BookingWizardState = {
  shipmentType: ShipmentType | null;
  serviceType: ServiceType | null;
  parcelType: ParcelType | null;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  originPincode: string;
  originCity: string;
  originState: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  destPincode: string;
  destCity: string;
  destState: string;
  destCountry: string;
  receiverAddress: string;
  weight: number;
  length: number | null;
  breadth: number | null;
  height: number | null;
  declaredValue: number;
  chargeableWeightKg: number;
  rateBreakdown: {
    baseCharge: number;
    fuelSurcharge: number;
    gstAmount: number;
    totalAmount: number;
    estimatedDeliveryStart: string;
    estimatedDeliveryEnd: string;
  } | null;
  razorpayOrderId: string | null;
};
