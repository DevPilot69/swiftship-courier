import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

type Props = {
  name: string;
  awb: string;
  origin: string;
  destination: string;
  service: string;
  amount: string;
  estimatedDelivery: string;
  trackUrl: string;
};

export default function BookingConfirmation({
  name,
  awb,
  origin,
  destination,
  service,
  amount,
  estimatedDelivery,
  trackUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your SwiftShip shipment is confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={check}>✓</Text>
            <Heading style={h1}>Shipment confirmed!</Heading>
            <Text style={sub}>Hi {name}, your courier booking is confirmed.</Text>
          </Section>
          <Section style={awbCard}>
            <Text style={awbLabel}>AWB number</Text>
            <Text style={awbValue}>{awb}</Text>
          </Section>
          <Section style={table}>
            <Row style={row}>
              <Column><Text style={th}>Route</Text></Column>
              <Column><Text style={td}>{origin} → {destination}</Text></Column>
            </Row>
            <Row style={row}>
              <Column><Text style={th}>Service</Text></Column>
              <Column><Text style={td}>{service}</Text></Column>
            </Row>
            <Row style={row}>
              <Column><Text style={th}>Amount</Text></Column>
              <Column><Text style={td}>{amount}</Text></Column>
            </Row>
            <Row style={row}>
              <Column><Text style={th}>Est. delivery</Text></Column>
              <Column><Text style={td}>{estimatedDelivery}</Text></Column>
            </Row>
          </Section>
          <Section style={{ textAlign: "center" as const, marginTop: "28px" }}>
            <Button href={trackUrl} style={btn}>
              Track your shipment
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            SwiftShip — Delivered. Always. · support@swiftship.in
          </Text>
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
  padding: "32px 20px",
  maxWidth: "560px",
};

const header = { textAlign: "center" as const, marginBottom: "20px" };

const check = {
  fontSize: "36px",
  color: "#16A34A",
  margin: "0 0 8px",
};

const h1 = {
  color: "#1A1A1A",
  fontSize: "24px",
  fontWeight: 700,
  margin: "0 0 8px",
  fontFamily: '"Sora", sans-serif',
};

const sub = { color: "#6B7280", fontSize: "14px", margin: 0 };

const awbCard = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  padding: "20px",
  textAlign: "center" as const,
  marginBottom: "20px",
};

const awbLabel = {
  color: "#6B7280",
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "0 0 8px",
};

const awbValue = {
  fontFamily: '"JetBrains Mono", monospace',
  fontSize: "22px",
  fontWeight: 700,
  color: "#CC2027",
  margin: 0,
};

const table = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "8px",
  padding: "16px 20px",
};

const row = { marginBottom: "8px" };

const th = {
  color: "#6B7280",
  fontSize: "13px",
  margin: 0,
  width: "120px",
};

const td = {
  color: "#1A1A1A",
  fontSize: "14px",
  margin: 0,
  fontWeight: 500,
};

const btn = {
  backgroundColor: "#CC2027",
  color: "#fff",
  padding: "12px 28px",
  borderRadius: "8px",
  fontWeight: 600,
  textDecoration: "none",
};

const hr = { borderColor: "#E5E7EB", margin: "28px 0" };

const footer = {
  color: "#9CA3AF",
  fontSize: "12px",
  textAlign: "center" as const,
};
