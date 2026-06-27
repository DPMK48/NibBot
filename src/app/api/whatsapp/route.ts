import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/bot";
import twilio from "twilio";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-twilio-signature");
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === "string") {
        params[key] = value;
      }
    });

    // Verify signature (with local development mode bypass)
    if (!signature && process.env.NODE_ENV === "development") {
      console.log("Twilio signature header missing in development; bypassing verification.");
    } else if (!authToken) {
      console.warn("TWILIO_AUTH_TOKEN is not configured. Webhook request signature check skipped.");
    } else {
      const proto = req.headers.get("x-forwarded-proto") || "https";
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
      const search = new URL(req.url).search;
      const url = `${proto}://${host}/api/whatsapp${search}`;

      const isValid = twilio.validateRequest(authToken, signature || "", url, params);

      if (!isValid) {
        console.warn("Unauthorized webhook request blocked. Signature verification failed.", {
          signature,
          url,
          params,
        });
        return new NextResponse("Unauthorized: Twilio signature verification failed.", { status: 403 });
      }
    }

    const from = String(params.From || "");
    const messageBody = String(params.Body || "");
    const numMedia = Number(params.NumMedia || 0);
    const mediaUrl = numMedia > 0 ? String(params.MediaUrl0 || "") : null;
    const mediaContentType = numMedia > 0 ? String(params.MediaContentType0 || "") : null;

    console.log("WhatsApp webhook validated:", { from, body: messageBody, numMedia, mediaUrl, mediaContentType });

    const reply = await handleIncomingMessage(from, messageBody, mediaUrl, mediaContentType);

    // Return TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(reply)}</Message>
</Response>`;

    console.log("WhatsApp webhook returning TwiML:", twiml);

    return new Response(twiml, {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
    });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Sorry, something went wrong. Please try again.</Message>
</Response>`;
    return new Response(twiml, {
      headers: { "Content-Type": "text/xml; charset=utf-8" },
      status: 200,
    });
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
