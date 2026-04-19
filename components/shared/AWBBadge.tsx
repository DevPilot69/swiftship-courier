import { cn } from "@/lib/utils";

export function AWBBadge({
  awb,
  className,
}: {
  awb: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border border-[#E5E7EB] bg-white px-2 py-1 font-mono text-sm font-semibold tracking-wide text-[#CC2027]",
        className,
      )}
    >
      {awb}
    </span>
  );
}
