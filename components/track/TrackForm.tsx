"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TrackForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [awb, setAwb] = React.useState("");

  React.useEffect(() => {
    const q = sp.get("awb");
    if (q) {
      const u = q.trim().toUpperCase();
      setAwb(u);
    }
  }, [sp]);

  function normalize(v: string) {
    return v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 12);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = normalize(awb);
    if (!/^SW\d{10}$/.test(v)) return;
    router.push(`/track?awb=${encodeURIComponent(v)}`);
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1 block text-sm font-medium text-[#374151]">
          Enter your 12-character AWB
        </label>
        <Input
          value={awb}
          onChange={(e) => setAwb(normalize(e.target.value))}
          className="font-mono tracking-widest"
          placeholder="SW2025011401"
          maxLength={12}
        />
        <p className="mt-1 text-xs text-[#6B7280]">
          e.g. SW2025011401 (starts with SW)
        </p>
      </div>
      <Button type="submit" className="sm:mb-0">
        Track
      </Button>
    </form>
  );
}
