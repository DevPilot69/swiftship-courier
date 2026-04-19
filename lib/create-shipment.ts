import { render } from "@react-email/render";
import type { Session } from "next-auth";
import {
  ParcelType,
  PaymentStatus,
  ServiceType,
  ShipmentStatus,
  ShipmentType,
} from "@prisma/client";
import BookingConfirmation from "@/emails/BookingConfirmation";
import { generateUniqueAwb } from "@/lib/awb";
import { prisma } from "@/lib/prisma";
import { calculateRate, volumetricWeightKg } from "@/lib/rate-engine";
import { getFromEmail, getResend } from "@/lib/resend";
import { getRazorpay } from "@/lib/razorpay";
import { sendSms } from "@/lib/twilio";
import { shipmentCreateSchema } from "@/lib/validators/shipment";
import { createHmac, timingSafeEqual } from "crypto";

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  try {
    const a = Buffer.from(signature, "utf8");
    const b = Buffer.from(expected, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function createPaidShipment(
  session: Session,
  raw: unknown,
): Promise<{ awb: string } | { error: string; status: number }> {
  const parsed = shipmentCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid shipment data", status: 400 };
  }
  const data = parsed.data;
  const userId = session.user?.id;
  if (!userId) {
    return { error: "Unauthorized", status: 401 };
  }

  const okSig = verifyRazorpaySignature(
    data.razorpayOrderId,
    data.razorpayPaymentId,
    data.razorpaySignature,
  );
  if (!okSig) {
    return { error: "Invalid payment signature", status: 400 };
  }

  let chargeableWeightKg = data.weight;
  if (
    data.parcelType !== "DOCUMENT" &&
    data.length &&
    data.breadth &&
    data.height
  ) {
    const vol = volumetricWeightKg(
      data.length,
      data.breadth,
      data.height,
    );
    chargeableWeightKg = Math.max(data.weight, vol);
  }

  const rate = calculateRate({
    shipmentType: data.shipmentType as ShipmentType,
    parcelType: data.parcelType as ParcelType,
    serviceType: data.serviceType as ServiceType,
    chargeableWeightKg,
    originCity: data.originCity,
    destCity: data.destCity,
  });

  const expectedPaise = Math.round(rate.totalAmount * 100);
  const rp = getRazorpay();
  if (!rp) {
    return { error: "Payments not configured", status: 503 };
  }
  let paidPaise = expectedPaise;
  try {
    const payment = await rp.payments.fetch(data.razorpayPaymentId);
    if (payment.status !== "captured" && payment.status !== "authorized") {
      return { error: "Payment not completed", status: 400 };
    }
    paidPaise = Number(payment.amount);
  } catch {
    return { error: "Could not verify payment with Razorpay", status: 400 };
  }

  if (paidPaise < expectedPaise) {
    return { error: "Paid amount does not match quote", status: 400 };
  }

  const awb = await generateUniqueAwb();
  const estimatedDelivery = rate.estimatedDeliveryEnd;

  const shipment = await prisma.shipment.create({
    data: {
      awbNumber: awb,
      userId,
      shipmentType: data.shipmentType,
      senderName: data.senderName,
      senderPhone: data.senderPhone,
      senderEmail: data.senderEmail,
      originPincode: data.originPincode,
      originCity: data.originCity,
      originState: data.originState,
      senderAddress: data.senderAddress,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      receiverEmail: data.receiverEmail,
      destPincode: data.destPincode,
      destCity: data.destCity,
      destState: data.destState,
      destCountry: data.destCountry,
      receiverAddress: data.receiverAddress,
      parcelType: data.parcelType,
      weight: data.weight,
      length: data.length ?? undefined,
      breadth: data.breadth ?? undefined,
      height: data.height ?? undefined,
      declaredValue: data.declaredValue,
      serviceType: data.serviceType,
      baseCharge: rate.baseCharge + rate.fuelSurcharge,
      taxAmount: rate.gstAmount,
      totalAmount: rate.totalAmount,
      paymentId: data.razorpayPaymentId,
      paymentStatus: PaymentStatus.PAID,
      status: ShipmentStatus.BOOKED,
      estimatedDelivery,
    },
  });

  await prisma.trackingEvent.create({
    data: {
      shipmentId: shipment.id,
      status: ShipmentStatus.BOOKED,
      location: data.originCity,
      description: "Shipment booked and awaiting pickup",
    },
  });

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const trackUrl = `${appUrl}/track?awb=${encodeURIComponent(awb)}`;

  await sendSms(
    `+91${data.senderPhone}`,
    `SwiftShip: Your shipment ${awb} is booked! Track at ${appUrl.replace(/^https?:\/\//, "")}/track`,
  );

  const resend = getResend();
  const fmt = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });
  const html = await render(
    BookingConfirmation({
      name: data.senderName,
      awb,
      origin: `${data.originCity}, ${data.originState}`,
      destination: `${data.destCity}, ${data.destState}`,
      service: data.serviceType,
      amount: fmt.format(rate.totalAmount),
      estimatedDelivery: estimatedDelivery.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      trackUrl,
    }),
  );
  if (resend) {
    await resend.emails.send({
      from: getFromEmail(),
      to: data.senderEmail,
      subject: `SwiftShip — Booking confirmed (${awb})`,
      html,
    });
  }

  return { awb };
}
