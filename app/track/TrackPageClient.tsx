"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { TrackForm } from "@/components/track/TrackForm";
import { TrackingTimeline } from "@/components/track/TrackingTimeline";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export function TrackPageClient() {
  const sp = useSearchParams();
  const awb = sp.get("awb");
  const [data, setData] = React.useState<unknown>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!awb) {
      setData(null);
      setErr(null);
      return;
    }
    const v = awb.trim().toUpperCase();
    if (!/^SW\d{10}$/.test(v)) {
      setErr("invalid_format");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      const r = await fetch(`/api/track/${encodeURIComponent(v)}`);
      const j = await r.json().catch(() => ({}));
      if (cancelled) return;
      if (!r.ok) {
        setData(null);
        setErr(j.error === "not_found" ? "not_found" : "error");
        setLoading(false);
        return;
      }
      setData(j);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [awb]);

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold text-[#1A1A1A]">
              Track shipment
            </h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              Enter your SwiftShip AWB to see live status.
            </p>
          </div>
          <TrackForm />
          {loading && (
            <p className="text-center text-sm text-[#6B7280]">Loading…</p>
          )}
          {err === "not_found" && (
            <Card>
              <CardContent className="p-6 text-center text-sm text-[#6B7280]">
                Shipment not found. Please check the number and try again.
              </CardContent>
            </Card>
          )}
          {err === "invalid_format" && (
            <Card>
              <CardContent className="p-6 text-center text-sm text-red-600">
                AWB must be 12 characters starting with SW.
              </CardContent>
            </Card>
          )}
          {data &&
          typeof data === "object" &&
          data !== null &&
          "awbNumber" in data ? (
            <TrackingTimeline
              {...(data as React.ComponentProps<typeof TrackingTimeline>)}
            />
          ) : null}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
