import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyOtpLoginToken } from "@/lib/otp-session";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
        otpToken: { label: "OTP token", type: "text" },
        channel: { label: "Channel", type: "text" },
      },
      async authorize(credentials) {
        const otpToken =
          typeof credentials?.otpToken === "string"
            ? credentials.otpToken
            : undefined;
        if (otpToken) {
          const v = verifyOtpLoginToken(otpToken);
          if (!v) return null;
          const user = await prisma.user.findUnique({
            where: { id: v.userId },
          });
          if (!user || !user.isVerified) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
          };
        }

        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";
        const channel = credentials?.channel as string | undefined;

        if (channel === "email") {
          const email = credentials?.email as string | undefined;
          if (!email) return null;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.isVerified) return null;
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
          };
        }

        if (channel === "phone") {
          const phone = credentials?.phone as string | undefined;
          if (!phone) return null;
          const user = await prisma.user.findUnique({ where: { phone } });
          if (!user || !user.isVerified) return null;
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.phone = (user as { phone?: string }).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },
});
