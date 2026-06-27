import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER; // e.g. whatsapp:+14155238886

function isValidTwilioConfig(): boolean {
  return !!(
    accountSid &&
    authToken &&
    accountSid.startsWith("AC") &&
    authToken.length > 10
  );
}

function getTwilioClient() {
  if (!isValidTwilioConfig()) {
    return null;
  }
  return twilio(accountSid, authToken);
}

export async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  const client = getTwilioClient();
  if (!client || !fromNumber) {
    console.log("[Twilio not configured] Would send to", to, ":", body);
    return;
  }

  // Ensure recipient number has whatsapp: prefix
  const toWhatsApp = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const fromWhatsApp = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;

  await client.messages.create({
    from: fromWhatsApp,
    to: toWhatsApp,
    body,
  });
}

export async function downloadMedia(mediaUrl: string): Promise<{ buffer: Buffer; contentType: string }> {
  if (!isValidTwilioConfig()) {
    throw new Error("Twilio credentials not configured");
  }

  const response = await fetch(mediaUrl, {
    headers: {
      Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download media: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "audio/ogg";
  const arrayBuffer = await response.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), contentType };
}
