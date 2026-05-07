import { randomUUID } from "crypto";

/** When true, `/api/payments/order` returns a fake order and verify accepts demo_* IDs (no Razorpay). */
export function isDemoPaymentsEnabled(): boolean {
  return process.env.DEMO_PAYMENTS === "true";
}

export function createDemoOrderId(): string {
  return `demo_order_${randomUUID()}`;
}

export function isDemoPaymentPayload(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  return (
    isDemoPaymentsEnabled() &&
    input.razorpayOrderId.startsWith("demo_order_") &&
    input.razorpayPaymentId.startsWith("demo_pay_") &&
    input.razorpaySignature === "demo"
  );
}
