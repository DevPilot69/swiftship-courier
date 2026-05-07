import { randomUUID } from "crypto";

/**
 * When true, forces demo orders even if Razorpay keys exist (for testing).
 * If false and Razorpay is not configured, the app still uses demo checkout automatically.
 */
export function isDemoPaymentsEnabled(): boolean {
  return process.env.DEMO_PAYMENTS === "true";
}

export function createDemoOrderId(): string {
  return `demo_order_${randomUUID()}`;
}

export function isDemoShapedPayment(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  return (
    input.razorpayOrderId.startsWith("demo_order_") &&
    input.razorpayPaymentId.startsWith("demo_pay_") &&
    input.razorpaySignature === "demo"
  );
}
