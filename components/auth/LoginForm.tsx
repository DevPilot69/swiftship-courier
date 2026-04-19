"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OTPInput } from "@/components/auth/OTPInput";

const emailPwdSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const phonePwdSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile"),
  password: z.string().min(1, "Password is required"),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [tab, setTab] = React.useState<"mobile" | "email">("mobile");
  const [otpModeEmail, setOtpModeEmail] = React.useState(false);
  const [otpModePhone, setOtpModePhone] = React.useState(false);
  const [emailOtp, setEmailOtp] = React.useState("");
  const [phoneOtp, setPhoneOtp] = React.useState("");
  const [cooldownEmail, setCooldownEmail] = React.useState(0);
  const [cooldownPhone, setCooldownPhone] = React.useState(0);

  const emailForm = useForm<z.infer<typeof emailPwdSchema>>({
    resolver: zodResolver(emailPwdSchema),
    defaultValues: { email: "", password: "" },
  });

  const phoneForm = useForm<z.infer<typeof phonePwdSchema>>({
    resolver: zodResolver(phonePwdSchema),
    defaultValues: { phone: "", password: "" },
  });

  React.useEffect(() => {
    if (cooldownEmail <= 0) return;
    const t = setInterval(() => setCooldownEmail((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldownEmail]);

  React.useEffect(() => {
    if (cooldownPhone <= 0) return;
    const t = setInterval(() => setCooldownPhone((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldownPhone]);

  async function submitEmailPwd(v: z.infer<typeof emailPwdSchema>) {
    const res = await signIn("credentials", {
      redirect: false,
      channel: "email",
      email: v.email,
      password: v.password,
    });
    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
  }

  async function submitPhonePwd(v: z.infer<typeof phonePwdSchema>) {
    const res = await signIn("credentials", {
      redirect: false,
      channel: "phone",
      phone: v.phone,
      password: v.password,
    });
    if (res?.error) {
      toast.error("Invalid phone or password");
      return;
    }
    router.push(callbackUrl);
  }

  async function sendEmailOtp() {
    const email = emailForm.getValues("email");
    const parsed = z.string().email().safeParse(email);
    if (!parsed.success) {
      toast.error("Enter a valid email");
      return;
    }
    const r = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: email,
        type: "EMAIL",
        purpose: "LOGIN",
      }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      toast.error(typeof j.error === "string" ? j.error : "Could not send OTP");
      return;
    }
    toast.success("OTP sent to email");
    setCooldownEmail(30);
  }

  async function sendPhoneOtp() {
    const phone = phoneForm.getValues("phone");
    const parsed = z.string().regex(/^[6-9]\d{9}$/).safeParse(phone);
    if (!parsed.success) {
      toast.error("Enter a valid 10-digit mobile");
      return;
    }
    const r = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: phone,
        type: "PHONE",
        purpose: "LOGIN",
      }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      toast.error(typeof j.error === "string" ? j.error : "Could not send OTP");
      return;
    }
    toast.success("OTP sent to phone");
    setCooldownPhone(30);
  }

  async function verifyEmailOtp() {
    const email = emailForm.getValues("email");
    const r = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: email,
        type: "EMAIL",
        purpose: "LOGIN",
        code: emailOtp,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      toast.error(j.error ?? "Invalid OTP");
      return;
    }
    if (j.loginToken) {
      const res = await signIn("credentials", {
        redirect: false,
        otpToken: j.loginToken,
        password: "otp",
        channel: "email",
      });
      if (res?.error) {
        toast.error("Could not sign in");
        return;
      }
      router.push(callbackUrl);
    }
  }

  async function verifyPhoneOtp() {
    const phone = phoneForm.getValues("phone");
    const r = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: phone,
        type: "PHONE",
        purpose: "LOGIN",
        code: phoneOtp,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      toast.error(j.error ?? "Invalid OTP");
      return;
    }
    if (j.loginToken) {
      const res = await signIn("credentials", {
        redirect: false,
        otpToken: j.loginToken,
        password: "otp",
        channel: "phone",
      });
      if (res?.error) {
        toast.error("Could not sign in");
        return;
      }
      router.push(callbackUrl);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-md rounded-lg border border-[#E5E7EB] bg-white p-8 shadow-card"
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
        <p className="text-sm text-[#6B7280]">Sign in to your account</p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "mobile" | "email")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="mobile">
          {!otpModePhone ? (
            <Form {...phoneForm}>
              <form
                onSubmit={phoneForm.handleSubmit(submitPhonePwd)}
                className="space-y-4"
              >
                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile number</FormLabel>
                      <div className="flex gap-2">
                        <span className="flex h-10 items-center rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm text-[#6B7280]">
                          +91
                        </span>
                        <FormControl>
                          <Input placeholder="9876543210" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={phoneForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="current-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Sign in
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-sm text-[#CC2027] hover:underline"
                  onClick={() => setOtpModePhone(true)}
                >
                  Login with OTP instead
                </button>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">
                Enter OTP sent to +91
                {"X".repeat(6)}
                {phoneForm.watch("phone").slice(-4)}
              </p>
              <Button type="button" variant="outline" className="w-full" onClick={sendPhoneOtp}>
                Send OTP
              </Button>
              <OTPInput value={phoneOtp} onChange={setPhoneOtp} />
              <Button type="button" className="w-full" onClick={verifyPhoneOtp}>
                Verify &amp; continue
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="text-[#CC2027] hover:underline disabled:opacity-50"
                  disabled={cooldownPhone > 0}
                  onClick={sendPhoneOtp}
                >
                  Resend OTP
                  {cooldownPhone > 0 ? ` (${cooldownPhone}s)` : ""}
                </button>
                <button
                  type="button"
                  className="text-[#6B7280] hover:underline"
                  onClick={() => setOtpModePhone(false)}
                >
                  Use password
                </button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="email">
          {!otpModeEmail ? (
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(submitEmailPwd)}
                className="space-y-4"
              >
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={emailForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="current-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Sign in
                </Button>
                <button
                  type="button"
                  className="w-full text-center text-sm text-[#CC2027] hover:underline"
                  onClick={() => setOtpModeEmail(true)}
                >
                  Login with OTP instead
                </button>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280]">Enter OTP sent to your email</p>
              <Button type="button" variant="outline" className="w-full" onClick={sendEmailOtp}>
                Send OTP
              </Button>
              <OTPInput value={emailOtp} onChange={setEmailOtp} />
              <Button type="button" className="w-full" onClick={verifyEmailOtp}>
                Verify &amp; continue
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="text-[#CC2027] hover:underline disabled:opacity-50"
                  disabled={cooldownEmail > 0}
                  onClick={sendEmailOtp}
                >
                  Resend OTP
                  {cooldownEmail > 0 ? ` (${cooldownEmail}s)` : ""}
                </button>
                <button
                  type="button"
                  className="text-[#6B7280] hover:underline"
                  onClick={() => setOtpModeEmail(false)}
                >
                  Use password
                </button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center text-sm text-[#6B7280]">
        New here?{" "}
        <Link href="/register" className="font-medium text-[#CC2027] hover:underline">
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}
