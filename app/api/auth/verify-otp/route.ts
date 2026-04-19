import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { OTPPurpose, OTPType } from "@prisma/client";
import { createOtpLoginToken } from "@/lib/otp-session";
import { prisma } from "@/lib/prisma";
import { checkPhoneOtpVerify } from "@/lib/twilio";
import { verifyOtpSchema } from "@/lib/validators/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { target, type, purpose, code, userId } = parsed.data;

  const record = await prisma.oTPRecord.findFirst({
    where: {
      target,
      type: type as OTPType,
      purpose: purpose as OTPPurpose,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return NextResponse.json(
      { error: "No active OTP found. Request a new code." },
      { status: 400 },
    );
  }

  if (record.failedAttempts >= 5) {
    await prisma.oTPRecord.update({
      where: { id: record.id },
      data: { used: true },
    });
    return NextResponse.json(
      { error: "Too many incorrect attempts. Request a new OTP." },
      { status: 400 },
    );
  }

  let valid = false;
  if (type === "PHONE" && process.env.TWILIO_VERIFY_SID) {
    const e164 = target.startsWith("+") ? target : `+91${target}`;
    valid = await checkPhoneOtpVerify(e164, code);
  }
  if (!valid) {
    valid = await bcrypt.compare(code, record.code);
  }

  if (!valid) {
    const attempts = record.failedAttempts + 1;
    await prisma.oTPRecord.update({
      where: { id: record.id },
      data: {
        failedAttempts: attempts,
        used: attempts >= 5,
      },
    });
    return NextResponse.json(
      { error: "Invalid OTP." },
      { status: 400 },
    );
  }

  await prisma.oTPRecord.update({
    where: { id: record.id },
    data: { used: true },
  });

  if (purpose === "REGISTER" && userId) {
    const otherType = type === "PHONE" ? "EMAIL" : "PHONE";
    const sibling = await prisma.oTPRecord.findFirst({
      where: {
        userId,
        purpose: "REGISTER",
        type: otherType,
        used: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (sibling) {
      await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });
      const loginToken = createOtpLoginToken(userId);
      return NextResponse.json({ ok: true, loginToken, completed: true });
    }

    return NextResponse.json({ ok: true, completed: false });
  }

  if (purpose === "LOGIN") {
    const user =
      type === "EMAIL"
        ? await prisma.user.findUnique({ where: { email: target } })
        : await prisma.user.findUnique({ where: { phone: target } });
    if (!user?.isVerified) {
      return NextResponse.json({ error: "Account not verified." }, { status: 400 });
    }
    const loginToken = createOtpLoginToken(user.id);
    return NextResponse.json({ ok: true, loginToken, completed: true });
  }

  return NextResponse.json({ ok: true, completed: true });
}
