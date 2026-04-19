import { z } from "zod";

export const registerStep1Schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .regex(/[A-Z]/, "Need at least one uppercase letter")
      .regex(/[0-9]/, "Need at least one number")
      .regex(/[^A-Za-z0-9]/, "Need at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const sendOtpSchema = z.object({
  target: z.string().min(3),
  type: z.enum(["PHONE", "EMAIL"]),
  purpose: z.enum(["REGISTER", "LOGIN", "VERIFY"]),
  userId: z.string().cuid().optional(),
});

export const verifyOtpSchema = z.object({
  target: z.string().min(3),
  type: z.enum(["PHONE", "EMAIL"]),
  purpose: z.enum(["REGISTER", "LOGIN", "VERIFY"]),
  code: z.string().regex(/^\d{6}$/, "Invalid code"),
  userId: z.string().cuid().optional(),
});

export const checkUniqueEmailSchema = z.object({
  email: z.string().email(),
});

export const checkUniquePhoneSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
});

export const loginPasswordSchema = z.discriminatedUnion("channel", [
  z.object({
    channel: z.literal("email"),
    email: z.string().email(),
    password: z.string().min(1),
  }),
  z.object({
    channel: z.literal("phone"),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    password: z.string().min(1),
  }),
]);

export const loginOtpRequestSchema = z.discriminatedUnion("channel", [
  z.object({
    channel: z.literal("email"),
    email: z.string().email(),
  }),
  z.object({
    channel: z.literal("phone"),
    phone: z.string().regex(/^[6-9]\d{9}$/),
  }),
]);
