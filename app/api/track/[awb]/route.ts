import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ awb: string }> },
) {
  const { awb } = await params;
  const normalized = awb.trim().toUpperCase();
  if (!/^SW\d{10}$/.test(normalized)) {
    return NextResponse.json({ error: "Invalid AWB" }, { status: 400 });
  }

  const shipment = await prisma.shipment.findUnique({
    where: { awbNumber: normalized },
    include: {
      trackingEvents: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!shipment) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    awbNumber: shipment.awbNumber,
    shipmentType: shipment.shipmentType,
    serviceType: shipment.serviceType,
    status: shipment.status,
    originCity: shipment.originCity,
    originState: shipment.originState,
    destCity: shipment.destCity,
    destState: shipment.destState,
    destCountry: shipment.destCountry,
    estimatedDelivery: shipment.estimatedDelivery.toISOString(),
    events: shipment.trackingEvents.map((e) => ({
      status: e.status,
      location: e.location,
      description: e.description,
      timestamp: e.timestamp.toISOString(),
    })),
  });
}
