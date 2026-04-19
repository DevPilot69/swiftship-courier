import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#CC2027] font-heading text-sm font-bold text-white">
              S
            </span>
            <span className="font-heading text-lg font-bold">SwiftShip</span>
          </div>
          <p className="mt-2 text-sm text-[#6B7280]">Delivered. Always.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-[#6B7280]">
          <Link href="/track" className="hover:text-[#CC2027]">
            Track
          </Link>
          <Link href="/login" className="hover:text-[#CC2027]">
            Login
          </Link>
          <Link href="/register" className="hover:text-[#CC2027]">
            Register
          </Link>
          <a href="mailto:support@swiftship.in" className="hover:text-[#CC2027]">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
