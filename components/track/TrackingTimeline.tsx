"use client";

import type { ShipmentStatus } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AWBBadge } from "@/components/shared/AWBBadge";
import { cn } from "@/lib/utils";

const ORDER: ShipmentStatus[] = [
  "BOOKED",
  "PICKUP_SCHEDULED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

type Event = {
  status: ShipmentStatus;
  location: string;
  description: string;
  timestamp: string;
};

type Props = {
  awbNumber: string;
  shipmentType: string;
  serviceType: string;
  status: ShipmentStatus;
  originCity: string;
  destCity: string;
  estimatedDelivery: string;
  events: Event[];
};

export function TrackingTimeline(data: Props) {
  const cancelled = data.status === "CANCELLED";

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-2 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-[#6B7280]">AWB</span>
            <AWBBadge awb={data.awbNumber} />
          </div>
          <p className="text-lg font-semibold text-[#1A1A1A]">
            {data.originCity} → {data.destCity} · {data.serviceType}
          </p>
          <p className="text-sm text-[#6B7280]">
            Estimated delivery:{" "}
            {new Date(data.estimatedDelivery).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <div className="pt-2">
            <StatusBadge status={data.status} />
          </div>
        </CardContent>
      </Card>

      <div className="relative pl-6">
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-[#E5E7EB]" />
        {(cancelled
          ? data.events.map((ev) => ({
              status: ev.status,
              description: ev.description,
              location: ev.location,
              time: ev.timestamp,
              done: true,
            }))
          : buildMergedTimeline(data)
        ).map((row, i) => (
          <div key={`${row.status}-${i}`} className="relative mb-6">
            <div
              className={cn(
                "absolute -left-6 top-1 h-3 w-3 rounded-full border-2",
                row.done
                  ? "border-[#CC2027] bg-[#CC2027]"
                  : "border-[#D1D5DB] bg-white",
              )}
            />
            <div className="pl-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-xs font-semibold tracking-wide text-[#1A1A1A]">
                  {row.status.replaceAll("_", " ")}
                </p>
                {row.time && (
                  <p className="text-xs text-[#6B7280]">
                    {new Date(row.time).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
              {row.description && (
                <p className="text-sm text-[#4B5563]">
                  {row.description} · {row.location}
                </p>
              )}
              {!row.done && !row.description && (
                <p className="text-sm text-[#9CA3AF]">Upcoming</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildMergedTimeline(data: Props): Array<{
  status: ShipmentStatus;
  description?: string;
  location?: string;
  time?: string;
  done: boolean;
}> {
  const map = new Map<ShipmentStatus, Event>();
  for (const e of data.events) {
    map.set(e.status, e);
  }
  const currentIdx = ORDER.indexOf(data.status);

  return ORDER.map((st, i) => {
    const ev = map.get(st);
    const done = i <= currentIdx || !!ev;
    return {
      status: st,
      description: ev?.description,
      location: ev?.location,
      time: ev?.timestamp,
      done,
    };
  });
}
