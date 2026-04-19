import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

type Props = {
  otp: string;
  purpose: string;
  name: string;
};

export default function OTPEmail({ otp, purpose, name }: Props) {
  const digits = otp.padStart(6, "0").slice(0, 6).split("");
  return (
    <Html>
      <Head />
      <Preview>Your SwiftShip verification code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoRow}>
            <Text style={logoMark}>S</Text>
            <Text style={logoWord}>SwiftShip</Text>
          </Section>
          <Heading style={h1}>Your verification code</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={textMuted}>
            Use this code to {purpose.toLowerCase()}. This code expires in 10
            minutes.
          </Text>
          <Section style={otpRow}>
            {digits.map((d, i) => (
              <Section key={i} style={otpBox}>
                <Text style={otpDigit}>{d}</Text>
              </Section>
            ))}
          </Section>
          <Text style={footerMuted}>
            If you did not request this, you can safely ignore this email.
          </Text>
          <Text style={brandFooter}>SwiftShip — Delivered. Always.</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#F7F7F7",
  fontFamily:
    '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "32px 24px",
  maxWidth: "520px",
};

const logoRow = { textAlign: "center" as const, marginBottom: "24px" };

const logoMark = {
  display: "inline-block",
  backgroundColor: "#CC2027",
  color: "#fff",
  fontWeight: 700,
  fontSize: "22px",
  lineHeight: "40px",
  width: "40px",
  height: "40px",
  borderRadius: "8px",
  textAlign: "center" as const,
  marginRight: "8px",
  fontFamily: '"Sora", sans-serif',
};

const logoWord = {
  display: "inline-block",
  fontSize: "22px",
  fontWeight: 700,
  color: "#1A1A1A",
  fontFamily: '"Sora", sans-serif',
};

const h1 = {
  color: "#1A1A1A",
  fontSize: "22px",
  fontWeight: 700,
  textAlign: "center" as const,
  margin: "0 0 16px",
  fontFamily: '"Sora", sans-serif',
};

const text = {
  color: "#1A1A1A",
  fontSize: "15px",
  lineHeight: "24px",
};

const textMuted = {
  color: "#6B7280",
  fontSize: "14px",
  lineHeight: "22px",
};

const otpRow = {
  display: "flex",
  justifyContent: "center",
  gap: "8px",
  margin: "28px 0",
};

const otpBox = {
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  width: "44px",
  height: "52px",
  backgroundColor: "#FFFFFF",
  textAlign: "center" as const,
};

const otpDigit = {
  fontSize: "22px",
  fontWeight: 700,
  fontFamily: '"JetBrains Mono", monospace',
  color: "#CC2027",
  lineHeight: "52px",
  margin: 0,
};

const footerMuted = {
  color: "#6B7280",
  fontSize: "13px",
  lineHeight: "20px",
  textAlign: "center" as const,
};

const brandFooter = {
  color: "#9CA3AF",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "24px",
};
