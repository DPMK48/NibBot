import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, verifications, transactions } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { normalizePhoneNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { phone, businessName } = await req.json();

    if (!phone || !businessName) {
      return NextResponse.json(
        { error: "Phone number and Business Name are required" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Check if the user exists in users table or has transactions
    // Since normalizedPhone starts with '+', let's also try checking without '+'
    // just in case of formatting discrepancies in database.
    const cleanPhoneNoPlus = normalizedPhone.replace("+", "");

    const existingUser = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.phone, normalizedPhone),
          eq(users.phone, cleanPhoneNoPlus)
        )
      )
      .limit(1);

    const userHasTransactions = await db
      .select()
      .from(transactions)
      .where(
        or(
          eq(transactions.userId, normalizedPhone),
          eq(transactions.userId, cleanPhoneNoPlus)
        )
      )
      .limit(1);

    if (existingUser.length === 0 && userHasTransactions.length === 0) {
      return NextResponse.json(
        {
          error:
            "No account found for this WhatsApp number. Please message the NibBot assistant on WhatsApp first to start recording transactions!",
        },
        { status: 404 }
      );
    }

    // If user exists, update their name if it is empty/null
    if (existingUser.length > 0 && !existingUser[0].name) {
      await db
        .update(users)
        .set({ name: businessName })
        .where(eq(users.id, existingUser[0].id));
    }

    // Determine language (default to user's language or English)
    const userLanguage = existingUser[0]?.language || "English";

    // Generate 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

    // Save verification details to the DB
    await db.insert(verifications).values({
      phone: normalizedPhone,
      code,
      expiresAt,
    });

    // Send WhatsApp verification code via Twilio
    // Twilio recipient numbers need to be of the form 'whatsapp:+2348012345678'
    const waRecipient = `whatsapp:${normalizedPhone}`;

    const textMessage =
      userLanguage === "Hausa"
        ? `Lambar tabbatarwa ta NibBot ita ce: *${code}*.\nTa aiki na tsawon mintuna 10.\nKada ku raba wannan lambar da kowa.`
        : `Your NibBot verification code is: *${code}*.\nIt is valid for 10 minutes.\nDo not share this code with anyone.`;

    await sendWhatsAppMessage(waRecipient, textMessage);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Request verification code error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}
