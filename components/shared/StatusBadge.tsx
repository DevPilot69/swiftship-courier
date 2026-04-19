import type { ShipmentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const map: Record<
  ShipmentStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  BOOKED: { label: "Booked", variant: "default" },
  PICKUP_SCHEDULED: { label: "Pickup scheduled", variant: "info" },
  PICKED_UP: { label: "Picked up", variant: "info" },
  IN_TRANSIT: { label: "In transit", variant: "warning" },
  OUT_FOR_DELIVERY: { label: "Out for delivery", variant: "warning" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
};

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  const m = map[status];
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
