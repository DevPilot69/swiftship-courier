import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
  }
  const res = await fetch(
    `https://api.postalpincode.in/pincode/${code}`,
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) {
    return NextResponse.json(
      { error: "Pincode service unavailable" },
      { status: 502 },
    );
  }
  const data = (await res.json()) as {
    Status?: string;
    PostOffice?: Array<{
      Name?: string;
      District?: string;
      State?: string;
    }>;
  };
  if (data.Status !== "Success" || !data.PostOffice?.length) {
    return NextResponse.json({ error: "Pincode not found" }, { status: 404 });
  }
  const po = data.PostOffice[0];
  return NextResponse.json({
    city: po.District ?? po.Name ?? "",
    state: po.State ?? "",
    offices: data.PostOffice,
  });
}
