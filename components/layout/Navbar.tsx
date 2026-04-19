import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="border-b border-[#E5E7EB] bg-white shadow-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#CC2027] font-heading text-lg font-bold text-white">
            S
          </span>
          <span className="font-heading text-xl font-bold text-[#1A1A1A]">
            SwiftShip
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-[#374151]">
          <Link href="/track" className="hover:text-[#CC2027]">
            Track Shipment
          </Link>
          <Link href="/login" className="hover:text-[#CC2027]">
            Login
          </Link>
          <Button asChild size="sm">
            <Link href="/register">Register</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
