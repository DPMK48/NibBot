import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { waitlist } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, businessType, language, story } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    const result = await db.insert(waitlist).values({
      name,
      phone,
      businessType: businessType || null,
      language: language || "English",
      story: story || null,
    }).returning();

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Waitlist/Story submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit story" },
      { status: 500 }
    );
  }
}
