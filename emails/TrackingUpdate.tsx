import {
  Body,
  Button,
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
  name: string;
  awb: string;
  status: string;
  description: string;
  location: string;
  trackUrl: string;
};

export default function TrackingUpdate({
  name,
  awb,
  status,
  description,
  location,
  trackUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Shipment {awb} update: {status}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoRow}>
            <Text style={logoMark}>S</Text>
            <Text style={logoWord}>SwiftShip</Text>
          </Section>
          <Heading style={h1}>Tracking update</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Your shipment <strong style={mono}>{awb}</strong> is now{" "}
            <strong>{status.replaceAll("_", " ")}</strong>.
          </Text>
          <Section style={card}>
            <Text style={muted}>{description}</Text>
            <Text style={loc}>📍 {location}</Text>
          </Section>
          <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
            <Button href={trackUrl} style={btn}>
              View full tracking
            </Button>
          </Section>
          <Text style={footer}>SwiftShip — Delivered. Always.</Text>
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

const logoRow = { textAlign: "center" as const, marginBottom: "20px" };

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
  margin: "0 0 16px",
  fontFamily: '"Sora", sans-serif',
};

const text = { color: "#1A1A1A", fontSize: "15px", lineHeight: "24px" };

const mono = { fontFamily: '"JetBrains Mono", monospace', color: "#CC2027" };

const card = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  padding: "16px 20px",
  marginTop: "16px",
};

const muted = { color: "#374151", fontSize: "14px", margin: "0 0 8px" };

const loc = { color: "#6B7280", fontSize: "13px", margin: 0 };

const btn = {
  backgroundColor: "#CC2027",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "8px",
  fontWeight: 600,
  textDecoration: "none",
};

const footer = {
  color: "#9CA3AF",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "28px",
};
