import { z } from "zod";
import {
  ParcelType,
  ServiceType,
  ShipmentType,
} from "@prisma/client";

export const ratesCalculateSchema = z.object({
  shipmentType: z.nativeEnum(ShipmentType),
  parcelType: z.nativeEnum(ParcelType),
  serviceType: z.nativeEnum(ServiceType),
  weightKg: z.number().positive(),
  lengthCm: z.number().positive().optional(),
  breadthCm: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  originCity: z.string().min(1),
  destCity: z.string().min(1),
});

export const shipmentCreateSchema = z
  .object({
    shipmentType: z.nativeEnum(ShipmentType),
    senderName: z.string().min(1),
    senderPhone: z.string().regex(/^[6-9]\d{9}$/),
    senderEmail: z.string().email(),
    originPincode: z.string().regex(/^\d{6}$/),
    originCity: z.string().min(1),
    originState: z.string().min(1),
    senderAddress: z.string().min(1, "Sender address required"),
    receiverName: z.string().min(1),
    receiverPhone: z.string().regex(/^[6-9]\d{9}$/),
    receiverEmail: z.string().email(),
    destPincode: z.string().min(1),
    destCity: z.string().min(1),
    destState: z.string().min(1),
    destCountry: z.string().min(1),
    receiverAddress: z.string().min(1, "Receiver address required"),
    parcelType: z.nativeEnum(ParcelType),
    weight: z.number().positive(),
    length: z.number().positive().optional().nullable(),
    breadth: z.number().positive().optional().nullable(),
    height: z.number().positive().optional().nullable(),
    declaredValue: z.number().nonnegative(),
    serviceType: z.nativeEnum(ServiceType),
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.shipmentType === "DOMESTIC") {
      if (!/^\d{6}$/.test(data.destPincode)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Destination pincode must be 6 digits",
          path: ["destPincode"],
        });
      }
    }
  });
