"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, Globe2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [awb, setAwb] = React.useState("");

  function quickTrack(e: React.FormEvent) {
    e.preventDefault();
    const v = awb.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 12);
    if (!/^SW\d{10}$/.test(v)) return;
    router.push(`/track?awb=${encodeURIComponent(v)}`);
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Navbar />
      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-heading text-4xl font-bold leading-tight text-[#1A1A1A] md:text-5xl"
            >
              Ship Anywhere. Track Everything.
            </motion.h1>
            <p className="mt-4 max-w-xl text-lg text-[#6B7280]">
              Reliable domestic &amp; international courier with real-time
              tracking.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">Book a Shipment</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/track">Track Order</Link>
              </Button>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-card"
          >
            <p className="text-sm font-medium text-[#374151]">Quick track</p>
            <form onSubmit={quickTrack} className="mt-3 flex gap-2">
              <Input
                placeholder="Enter AWB number"
                value={awb}
                onChange={(e) =>
                  setAwb(
                    e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
                  )
                }
                maxLength={12}
                className="font-mono"
              />
              <Button type="submit">Track</Button>
            </form>
            <p className="mt-2 text-xs text-[#6B7280]">e.g. SW2025011401</p>
          </motion.div>
        </section>

        <section className="border-t border-[#E5E7EB] bg-white py-14">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center font-heading text-2xl font-bold text-[#1A1A1A] md:text-3xl">
              Why SwiftShip
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[#6B7280] md:text-base">
              Everything you need for fast, transparent deliveries — from
              booking to doorstep.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-6xl gap-8 px-4 md:grid-cols-3">
            {[
              {
                icon: Package,
                title: "Easy Booking",
                description: "Book in 5 minutes online",
              },
              {
                icon: Search,
                title: "Live Tracking",
                description: "Real-time shipment updates",
              },
              {
                icon: Globe2,
                title: "Domestic & Intl",
                description: "We ship across India and worldwide",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-[#E5E7EB] bg-[#F7F7F7] p-6 shadow-card"
              >
                <f.icon className="mb-3 h-8 w-8 text-[#CC2027]" />
                <h3 className="font-heading text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-[#6B7280]">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-[#E5E7EB] py-14">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-center font-heading text-2xl font-bold text-[#1A1A1A]">
              How it works
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-4">
              {[
                "Enter details",
                "Get instant price",
                "Pay online",
                "Track your parcel",
              ].map((t, i) => (
                <div
                  key={t}
                  className="rounded-lg border border-[#E5E7EB] bg-white p-5 text-center shadow-card"
                >
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#CC2027] text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <p className="font-medium text-[#1A1A1A]">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
