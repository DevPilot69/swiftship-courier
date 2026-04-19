import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-12">
        <Suspense fallback={<p className="text-center text-sm text-[#6B7280]">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
