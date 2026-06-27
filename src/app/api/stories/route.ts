import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { waitlist } from "@/db/schema";
import { isNotNull, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const stories = await db
      .select({
        id: waitlist.id,
        name: waitlist.name,
        businessType: waitlist.businessType,
        language: waitlist.language,
        story: waitlist.story,
        createdAt: waitlist.createdAt,
      })
      .from(waitlist)
      .where(isNotNull(waitlist.story))
      .orderBy(desc(waitlist.createdAt));

    return NextResponse.json({ success: true, data: stories });
  } catch (error) {
    console.error("Get stories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}
