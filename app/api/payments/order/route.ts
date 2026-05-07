import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDemoOrderId, isDemoPaymentsEnabled } from "@/lib/demo-payments";
import { getRazorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const amountPaise = Number(body?.amountPaise);
  if (!Number.isFinite(amountPaise) || amountPaise < 100) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const rp = getRazorpay();
  if (isDemoPaymentsEnabled() || !rp) {
    return NextResponse.json({
      orderId: createDemoOrderId(),
      amount: amountPaise,
      currency: "INR",
      demo: true,
    });
  }

  const receipt = `ss_${session.user.id.slice(0, 8)}_${Date.now()}`;
  const order = await rp.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt,
    notes: { userId: session.user.id },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID,
  });
}
