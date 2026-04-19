import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomInt, randomUUID } from "crypto";
import { render } from "@react-email/render";
import { OTPPurpose, OTPType } from "@prisma/client";
import OTPEmail from "@/emails/OTPEmail";
import { prisma } from "@/lib/prisma";
import { getFromEmail, getResend } from "@/lib/resend";
import { sendPhoneOtpVerify, sendSms } from "@/lib/twilio";
import { sendOtpSchema } from "@/lib/validators/auth";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_SENDS = 3;

function generateSixDigitCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = sendOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { target, type, purpose, userId } = parsed.data;
  const since = new Date(Date.now() - WINDOW_MS);

  const recentCount = await prisma.oTPRecord.count({
    where: {
      target,
      type: type as OTPType,
      purpose: purpose as OTPPurpose,
      createdAt: { gte: since },
    },
  });

  if (recentCount >= MAX_SENDS) {
    return NextResponse.json(
      { error: "Too many OTP requests. Try again later." },
      { status: 429 },
    );
  }

  if (purpose === "LOGIN") {
    if (type === "EMAIL") {
      const user = await prisma.user.findUnique({
        where: { email: target },
      });
      if (!user?.isVerified) {
        return NextResponse.json(
          { error: "Account not found or not verified." },
          { status: 400 },
        );
      }
    } else {
      const user = await prisma.user.findUnique({
        where: { phone: target },
      });
      if (!user?.isVerified) {
        return NextResponse.json(
          { error: "Account not found or not verified." },
          { status: 400 },
        );
      }
    }
  }

  if (purpose === "REGISTER") {
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required for registration OTP." },
        { status: 400 },
      );
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Invalid user." }, { status: 400 });
    }
    if (type === "EMAIL" && user.email !== target) {
      return NextResponse.json({ error: "Email mismatch." }, { status: 400 });
    }
    if (type === "PHONE" && user.phone !== target) {
      return NextResponse.json({ error: "Phone mismatch." }, { status: 400 });
    }
  }

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  if (type === "EMAIL") {
    const plainCode = generateSixDigitCode();
    const codeHash = await bcrypt.hash(plainCode, 12);
    await prisma.oTPRecord.create({
      data: {
        userId: userId ?? null,
        target,
        code: codeHash,
        type: "EMAIL",
        purpose: purpose as OTPPurpose,
        expiresAt,
      },
    });
    const resend = getResend();
    const user =
      purpose === "REGISTER" && userId
        ? await prisma.user.findUnique({ where: { id: userId } })
        : await prisma.user.findUnique({ where: { email: target } });
    const name = user?.name ?? "there";
    const purposeLabel =
      purpose === "REGISTER"
        ? "complete your registration"
        : purpose === "LOGIN"
          ? "sign in to SwiftShip"
          : "verify your account";
    const html = await render(
      OTPEmail({ otp: plainCode, purpose: purposeLabel, name }),
    );
    if (resend) {
      await resend.emails.send({
        from: getFromEmail(),
        to: target,
        subject: "Your SwiftShip verification code",
        html,
      });
    } else if (process.env.NODE_ENV === "development") {
      console.info("[Resend skipped] Email OTP:", target.slice(0, 3) + "***", plainCode);
    }
  } else {
    const e164 = target.startsWith("+") ? target : `+91${target}`;
    const usedVerify = await sendPhoneOtpVerify(e164);
    const smsPlain = usedVerify ? null : generateSixDigitCode();
    const codeHash = smsPlain
      ? await bcrypt.hash(smsPlain, 12)
      : await bcrypt.hash(`VERIFY:${randomUUID()}`, 12);
    await prisma.oTPRecord.create({
      data: {
        userId: userId ?? null,
        target,
        code: codeHash,
        type: "PHONE",
        purpose: purpose as OTPPurpose,
        expiresAt,
      },
    });
    if (smsPlain) {
      await sendSms(
        e164,
        `SwiftShip: Your verification code is ${smsPlain}. Valid for 10 minutes.`,
      );
    }
  }

  return NextResponse.json({ ok: true });
}
