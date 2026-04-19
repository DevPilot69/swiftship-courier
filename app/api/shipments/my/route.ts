import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number(searchParams.get("limit") ?? "10") || 10),
  );
  const status = searchParams.get("status");

  const where = {
    userId: session.user.id,
    ...(status && status !== "ALL"
      ? {
          status: status as
            | "BOOKED"
            | "PICKUP_SCHEDULED"
            | "PICKED_UP"
            | "IN_TRANSIT"
            | "OUT_FOR_DELIVERY"
            | "DELIVERED"
            | "CANCELLED",
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      orderBy: { bookedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        awbNumber: true,
        shipmentType: true,
        originCity: true,
        originState: true,
        destCity: true,
        destState: true,
        destCountry: true,
        serviceType: true,
        totalAmount: true,
        status: true,
        bookedAt: true,
        weight: true,
      },
    }),
    prisma.shipment.count({ where }),
  ]);

  return NextResponse.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}
