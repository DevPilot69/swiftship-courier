"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Link from "next/link";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OTPInput } from "@/components/auth/OTPInput";
import { registerStep1Schema } from "@/lib/validators/auth";
import type { z } from "zod";

function maskPhone(phone: string) {
  if (phone.length < 4) return "+91XXXXXXXXXX";
  return `+91${"X".repeat(6)}${phone.slice(-4)}`;
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const vis = local.slice(0, Math.min(2, local.length));
  return `${vis}***@${domain}`;
}

export function RegisterForm() {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [phoneOtp, setPhoneOtp] = React.useState("");
  const [emailOtp, setEmailOtp] = React.useState("");
  const [phoneErr, setPhoneErr] = React.useState<string | null>(null);
  const [emailErr, setEmailErr] = React.useState<string | null>(null);
  const [cooldownPhone, setCooldownPhone] = React.useState(0);
  const [cooldownEmail, setCooldownEmail] = React.useState(0);

  const form = useForm({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (cooldownPhone <= 0) return;
    const t = setInterval(() => setCooldownPhone((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldownPhone]);

  React.useEffect(() => {
    if (cooldownEmail <= 0) return;
    const t = setInterval(() => setCooldownEmail((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldownEmail]);

  async function onStep1(values: z.infer<typeof registerStep1Schema>) {
    const reg = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await reg.json().catch(() => ({}));
    if (!reg.ok) {
      toast.error("Could not create account");
      if (data.error) form.setError("root", { message: String(data.error) });
      return;
    }
    setUserId(data.userId);

    const phoneBody = {
      target: values.phone,
      type: "PHONE" as const,
      purpose: "REGISTER" as const,
      userId: data.userId,
    };
    const emailBody = {
      target: values.email,
      type: "EMAIL" as const,
      purpose: "REGISTER" as const,
      userId: data.userId,
    };

    const [r1, r2] = await Promise.all([
      fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(phoneBody),
      }),
      fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailBody),
      }),
    ]);

    if (!r1.ok || !r2.ok) {
      toast.error("Account created but OTP delivery failed. Use resend.");
    } else {
      toast.success("Verification codes sent");
    }
    setCooldownPhone(30);
    setCooldownEmail(30);
    setStep(2);
  }

  async function resendPhone() {
    if (!userId) return;
    const phone = form.getValues("phone");
    const r = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: phone,
        type: "PHONE",
        purpose: "REGISTER",
        userId,
      }),
    });
    if (!r.ok) {
      toast.error("Could not resend phone OTP");
      return;
    }
    toast.success("Phone OTP resent");
    setCooldownPhone(30);
  }

  async function resendEmail() {
    if (!userId) return;
    const email = form.getValues("email");
    const r = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: email,
        type: "EMAIL",
        purpose: "REGISTER",
        userId,
      }),
    });
    if (!r.ok) {
      toast.error("Could not resend email OTP");
      return;
    }
    toast.success("Email OTP resent");
    setCooldownEmail(30);
  }

  async function verifyBoth() {
    if (!userId) return;
    setPhoneErr(null);
    setEmailErr(null);
    const phone = form.getValues("phone");
    const email = form.getValues("email");

    const rPhone = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: phone,
        type: "PHONE",
        purpose: "REGISTER",
        code: phoneOtp,
        userId,
      }),
    });
    const jPhone = await rPhone.json().catch(() => ({}));
    if (!rPhone.ok) {
      setPhoneErr(
        typeof jPhone.error === "string"
          ? jPhone.error
          : "Invalid phone OTP",
      );
      return;
    }

    const rEmail = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: email,
        type: "EMAIL",
        purpose: "REGISTER",
        code: emailOtp,
        userId,
      }),
    });
    const jEmail = await rEmail.json().catch(() => ({}));
    if (!rEmail.ok) {
      setEmailErr(
        typeof jEmail.error === "string"
          ? jEmail.error
          : "Invalid email OTP",
      );
      return;
    }

    if (jEmail.loginToken) {
      const res = await signIn("credentials", {
        redirect: false,
        otpToken: jEmail.loginToken,
        password: "otp",
        channel: "email",
      });
      if (res?.error) {
        toast.error("Could not sign in");
        return;
      }
      if (!res?.ok) {
        toast.error("Could not sign in. Try again.");
        return;
      }
      window.location.assign("/dashboard");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-2xl rounded-lg border border-[#E5E7EB] bg-white p-8 shadow-card"
    >
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#CC2027] font-heading text-lg font-bold text-white">
            S
          </span>
          <span className="font-heading text-2xl font-bold text-[#1A1A1A]">
            SwiftShip
          </span>
        </div>
        <p className="text-sm text-[#6B7280]">
          {step === 1 ? "Create your account" : "Verify phone & email"}
        </p>
      </div>

      {step === 1 ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onStep1)}
            className="space-y-4 max-w-md mx-auto"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      {...field}
                      onBlur={async (e) => {
                        field.onBlur();
                        const v = e.target.value;
                        if (!v.includes("@")) return;
                        const r = await fetch("/api/auth/check-email", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: v }),
                        });
                        const j = await r.json().catch(() => ({}));
                        if (j.available === false) {
                          form.setError("email", { message: "Email already registered" });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <div className="flex gap-2">
                    <span className="flex h-10 items-center rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm text-[#6B7280]">
                      +91
                    </span>
                    <FormControl>
                      <Input
                        {...field}
                        onBlur={async (e) => {
                          field.onBlur();
                          const v = e.target.value;
                          if (!/^[6-9]\d{9}$/.test(v)) return;
                          const r = await fetch("/api/auth/check-phone", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ phone: v }),
                          });
                          const j = await r.json().catch(() => ({}));
                          if (j.available === false) {
                            form.setError("phone", { message: "Phone already registered" });
                          }
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </Form>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-medium text-[#1A1A1A]">
              Enter OTP sent to {maskPhone(form.watch("phone"))}
            </p>
            <OTPInput value={phoneOtp} onChange={setPhoneOtp} />
            {phoneErr && (
              <p className="mt-2 text-sm text-red-600">{phoneErr}</p>
            )}
            <button
              type="button"
              className="mt-3 text-sm text-[#CC2027] hover:underline disabled:opacity-50"
              disabled={cooldownPhone > 0}
              onClick={resendPhone}
            >
              Resend OTP
              {cooldownPhone > 0 ? ` (${cooldownPhone}s)` : ""}
            </button>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-[#1A1A1A]">
              Enter OTP sent to {maskEmail(form.watch("email"))}
            </p>
            <OTPInput value={emailOtp} onChange={setEmailOtp} />
            {emailErr && (
              <p className="mt-2 text-sm text-red-600">{emailErr}</p>
            )}
            <button
              type="button"
              className="mt-3 text-sm text-[#CC2027] hover:underline disabled:opacity-50"
              disabled={cooldownEmail > 0}
              onClick={resendEmail}
            >
              Resend OTP
              {cooldownEmail > 0 ? ` (${cooldownEmail}s)` : ""}
            </button>
          </div>
          <div className="md:col-span-2">
            <Button
              type="button"
              className="w-full"
              onClick={verifyBoth}
              disabled={phoneOtp.length !== 6 || emailOtp.length !== 6}
            >
              Verify &amp; continue
            </Button>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-[#6B7280]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#CC2027] hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
