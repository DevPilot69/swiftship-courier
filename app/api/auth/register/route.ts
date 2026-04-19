import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerStep1Schema } from "@/lib/validators/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerStep1Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (existing) {
    if (existing.email === email) {
      return NextResponse.json(
        { error: { email: ["Email already registered"] } },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: { phone: ["Phone already registered"] } },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      isVerified: false,
    },
    select: { id: true, email: true, phone: true, name: true },
  });

  return NextResponse.json({ userId: user.id, email: user.email, phone: user.phone, name: user.name });
}
