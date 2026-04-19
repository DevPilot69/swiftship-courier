import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createPaidShipment } from "@/lib/create-shipment";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const result = await createPaidShipment(session, body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ awb: result.awb });
}
