import { prisma } from "@/lib/prisma";

function yyyymmdd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export async function generateUniqueAwb(): Promise<string> {
  const datePart = yyyymmdd(new Date());
  const prefix = `SW${datePart}`;

  const latest = await prisma.shipment.findFirst({
    where: { awbNumber: { startsWith: prefix } },
    orderBy: { awbNumber: "desc" },
    select: { awbNumber: true },
  });

  let seq = 1;
  if (latest?.awbNumber) {
    const suffix = latest.awbNumber.slice(prefix.length);
    const n = parseInt(suffix, 10);
    if (!Number.isNaN(n)) seq = n + 1;
  }

  for (let attempt = 0; attempt < 200; attempt++) {
    const suffix = String(seq + attempt).padStart(2, "0");
    if (prefix.length + suffix.length !== 12) {
      throw new Error("AWB format invariant failed");
    }
    const candidate = `${prefix}${suffix}`;
    const exists = await prisma.shipment.findUnique({
      where: { awbNumber: candidate },
    });
    if (!exists) return candidate;
  }

  throw new Error("Could not allocate unique AWB");
}
