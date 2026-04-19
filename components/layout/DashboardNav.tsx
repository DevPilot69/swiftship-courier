"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Package, LayoutDashboard, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/ship", label: "Ship", icon: Truck },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
];

export function DashboardNav() {
  const { data } = useSession();
  const pathname = usePathname();

  return (
    <header className="border-b border-[#E5E7EB] bg-white shadow-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#CC2027] font-heading text-lg font-bold text-white">
            S
          </span>
          <span className="font-heading text-xl font-bold text-[#1A1A1A]">
            SwiftShip
          </span>
        </Link>
        <nav className="flex flex-1 flex-wrap items-center justify-center gap-2 md:justify-start md:pl-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[#6B7280] hover:bg-[#F7F7F7] hover:text-[#1A1A1A]",
                pathname === l.href && "bg-[#F7F7F7] text-[#CC2027]",
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
          <Link
            href="/track"
            className="rounded-md px-3 py-2 text-sm font-medium text-[#6B7280] hover:bg-[#F7F7F7]"
          >
            Track
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden text-right text-sm md:block">
            <p className="font-medium text-[#1A1A1A]">{data?.user?.name}</p>
            <p className="text-xs text-[#6B7280]">{data?.user?.email}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-sm font-semibold text-[#374151]">
            {(data?.user?.name ?? "?").slice(0, 1).toUpperCase()}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
