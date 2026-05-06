import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed-database";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret || secret.length < 16) {
    return NextResponse.json(
      { error: "Seed endpoint is not configured (set SEED_SECRET in env)." },
      { status: 503 },
    );
  }

  const headerSecret =
    req.headers.get("x-seed-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();

  if (!headerSecret || headerSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await seedDatabase();
    await prisma.$disconnect();
    return NextResponse.json({
      ok: true,
      message:
        "Demo data seeded. Login test@swiftship.in / Test@1234 — track SW2025011401 … SW2025011405",
    });
  } catch (e) {
    console.error("[seed]", e);
    await prisma.$disconnect().catch(() => undefined);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Seed failed" },
      { status: 500 },
    );
  }
}
