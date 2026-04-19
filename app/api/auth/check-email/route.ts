import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkUniqueEmailSchema } from "@/lib/validators/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = checkUniqueEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ available: false }, { status: 400 });
  }
  const found = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  return NextResponse.json({ available: !found });
}
