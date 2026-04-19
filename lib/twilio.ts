import Twilio from "twilio";

export function getTwilioClient(): Twilio.Twilio | null {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return Twilio(sid, token);
}

export async function sendSms(toE164: string, body: string): Promise<void> {
  const client = getTwilioClient();
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!client || !from) {
    if (process.env.NODE_ENV === "development") {
      console.info("[Twilio SMS skipped]", { to: "***", bodyLength: body.length });
    }
    return;
  }
  await client.messages.create({ from, to: toE164, body });
}

export async function sendPhoneOtpVerify(
  phoneE164: string,
): Promise<boolean> {
  const verifySid = process.env.TWILIO_VERIFY_SID;
  const client = getTwilioClient();
  if (!client || !verifySid) {
    if (process.env.NODE_ENV === "development") {
      console.info("[Twilio Verify skipped — using SMS OTP flow]");
    }
    return false;
  }
  await client.verify.v2.services(verifySid).verifications.create({
    to: phoneE164,
    channel: "sms",
  });
  return true;
}

export async function checkPhoneOtpVerify(
  phoneE164: string,
  code: string,
): Promise<boolean> {
  const verifySid = process.env.TWILIO_VERIFY_SID;
  const client = getTwilioClient();
  if (!client || !verifySid) return false;
  const check = await client.verify.v2
    .services(verifySid)
    .verificationChecks.create({ to: phoneE164, code });
  return check.status === "approved";
}
