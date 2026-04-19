"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AWBBadge } from "@/components/shared/AWBBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";

type Row = {
  awbNumber: string;
  shipmentType: string;
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  destCountry: string;
  serviceType: string;
  totalAmount: number;
  status: string;
  bookedAt: string;
  weight: number;
};

function OrdersContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const filter = sp.get("filter") ?? "ALL";
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await fetch(`/api/shipments/my?limit=100`);
      const j = await r.json().catch(() => ({ items: [] }));
      if (cancelled) return;
      setRows(j.items ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = React.useMemo(() => {
    if (filter === "ALL") return rows;
    if (filter === "DELIVERED") {
      return rows.filter((r) => r.status === "DELIVERED");
    }
    if (filter === "CANCELLED") {
      return rows.filter((r) => r.status === "CANCELLED");
    }
    if (filter === "ACTIVE") {
      return rows.filter(
        (r) => r.status !== "DELIVERED" && r.status !== "CANCELLED",
      );
    }
    return rows;
  }, [rows, filter]);

  const fmt = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#1A1A1A]">
            My shipments
          </h1>
          <p className="text-sm text-[#6B7280]">All bookings with AWB and status.</p>
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={filter}
            onValueChange={(v) => {
              router.replace(`/dashboard/orders?filter=${encodeURIComponent(v)}`);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white shadow-card">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[#F9FAFB] text-xs uppercase text-[#6B7280]">
            <tr>
              <th className="px-4 py-3">AWB</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">From → To</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3"> </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-[#6B7280]">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-[#6B7280]">
                  No shipments.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((s) => (
                <tr key={s.awbNumber} className="border-t border-[#E5E7EB]">
                  <td className="px-4 py-3">
                    <AWBBadge awb={s.awbNumber} />
                  </td>
                  <td className="px-4 py-3">{s.shipmentType}</td>
                  <td className="px-4 py-3">
                    {s.originCity}, {s.originState} → {s.destCity}, {s.destState}
                    {s.destCountry !== "India" ? ` (${s.destCountry})` : ""}
                  </td>
                  <td className="px-4 py-3">{s.serviceType}</td>
                  <td className="px-4 py-3">{fmt.format(s.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status as never} />
                  </td>
                  <td className="px-4 py-3">
                    {new Date(s.bookedAt).toLocaleDateString("en-IN")}
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
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#6B7280]">Loading…</p>}>
      <OrdersContent />
    </Suspense>
  );
}
