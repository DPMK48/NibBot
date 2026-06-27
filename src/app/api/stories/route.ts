import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const list = await db
      .select({
        id: stories.id,
        name: stories.name,
        businessType: stories.businessType,
        language: stories.language,
        story: stories.story,
        createdAt: stories.createdAt,
      })
      .from(stories)
      .orderBy(desc(stories.createdAt));

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("Get stories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, businessType, language, story } = body;

    if (!name || !phone || !story) {
      return NextResponse.json(
        { error: "Name, phone, and story are required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(stories)
      .values({
        name,
        phone,
        businessType: businessType || null,
        language: language || "English",
        story,
      })
      .returning();

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Story submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit story" },
      { status: 500 }
    );
  }
}
