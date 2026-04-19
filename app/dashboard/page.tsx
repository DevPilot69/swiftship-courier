import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Search } from "lucide-react";
import { AWBBadge } from "@/components/shared/AWBBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default async function DashboardHomePage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const recent = await prisma.shipment.findMany({
    where: { userId },
    orderBy: { bookedAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[#1A1A1A]">
          Welcome back, {session!.user!.name}
        </h1>
        <p className="text-sm text-[#6B7280]">Manage your shipments in one place.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-[#E5E7EB] shadow-card">
          <CardContent className="space-y-3 p-8">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-[#CC2027]" />
              <div>
                <h2 className="font-heading text-lg font-semibold">Ship a Package</h2>
                <p className="text-sm text-[#6B7280]">
                  Book domestic or international shipment in minutes.
                </p>
              </div>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/dashboard/ship">Book Now →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB] shadow-card">
          <CardContent className="space-y-3 p-8">
            <div className="flex items-center gap-3">
              <Search className="h-8 w-8 text-[#CC2027]" />
              <div>
                <h2 className="font-heading text-lg font-semibold">Track your Order</h2>
                <p className="text-sm text-[#6B7280]">
                  Enter AWB to see live status.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/track">Track Now →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">My recent shipments</h2>
          <Link
            href="/dashboard/orders"
            className="text-sm font-medium text-[#CC2027] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white shadow-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#F9FAFB] text-xs uppercase text-[#6B7280]">
              <tr>
                <th className="px-4 py-3">AWB</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3"> </th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-[#6B7280]">
                    No shipments yet. Book your first parcel.
                  </td>
                </tr>
              )}
              {recent.map((s) => (
                <tr key={s.id} className="border-t border-[#E5E7EB]">
                  <td className="px-4 py-3">
                    <AWBBadge awb={s.awbNumber} />
                  </td>
                  <td className="px-4 py-3">
                    {s.destCity}, {s.destState}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3">
                    {s.bookedAt.toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/track?awb=${encodeURIComponent(s.awbNumber)}`}
                      className="text-[#CC2027] hover:underline"
                    >
                      Track
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
