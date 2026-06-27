import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, verifications, transactions } from "@/db/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { normalizePhoneNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { phone, code, businessName } = await req.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone number and verification code are required" },
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

    // Find the latest code for this phone number
    const latestVerification = await db
      .select()
      .from(verifications)
      .where(eq(verifications.phone, normalizedPhone))
      .orderBy(desc(verifications.createdAt))
      .limit(1);

    if (latestVerification.length === 0) {
      return NextResponse.json(
        { error: "No verification code requested for this number" },
        { status: 400 }
      );
    }

    const verifyRecord = latestVerification[0];

    // Check code match
    if (verifyRecord.code !== code.trim()) {
      return NextResponse.json(
        { error: "Incorrect verification code. Please try again." },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date(verifyRecord.expiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // If verification succeeded, delete/cleanup verification records for this phone number
    // to prevent reuse
    // (Optional: can delete or leave in db. Let's delete to keep database clean)
    // await db.delete(verifications).where(eq(verifications.phone, normalizedPhone));

    // Get the user from db
    const cleanPhoneNoPlus = normalizedPhone.replace("+", "");
    const userResult = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.phone, normalizedPhone),
          eq(users.phone, cleanPhoneNoPlus)
        )
      )
      .limit(1);

    const user = userResult[0] || null;

    // Fetch transactions
    const userTransactions = await db
      .select()
      .from(transactions)
      .where(
        or(
          eq(transactions.userId, normalizedPhone),
          eq(transactions.userId, cleanPhoneNoPlus)
        )
      )
      .orderBy(desc(transactions.date));

    // Process summary stats
    let totalSales = 0;
    let totalPurchases = 0;

    // Process chart data grouped by date (sales & profit timeline)
    const chartDataMap = new Map<
      string,
      { date: string; sales: number; purchases: number; profit: number }
    >();

    for (const t of userTransactions) {
      const amount = Number(t.total || 0);
      if (t.type === "SALE") {
        totalSales += amount;
      } else if (t.type === "PURCHASE") {
        totalPurchases += amount;
      }

      if (t.date) {
        const dateStr = new Date(t.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        if (!chartDataMap.has(dateStr)) {
          chartDataMap.set(dateStr, {
            date: dateStr,
            sales: 0,
            purchases: 0,
            profit: 0,
          });
        }

        const currentBucket = chartDataMap.get(dateStr)!;
        if (t.type === "SALE") {
          currentBucket.sales += amount;
          currentBucket.profit += amount;
        } else if (t.type === "PURCHASE") {
          currentBucket.purchases += amount;
          currentBucket.profit -= amount;
        }
      }
    }

    const netProfit = totalSales - totalPurchases;

    // Sort chart data chronologically
    const chartData = Array.from(chartDataMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      success: true,
      user: {
        phone: normalizedPhone,
        businessName: businessName || user?.name || "My Business",
        language: user?.language || "English",
        businessType: user?.businessType || "Retail",
      },
      stats: {
        totalSales,
        totalPurchases,
        netProfit,
        transactionCount: userTransactions.length,
      },
      chartData,
      transactions: userTransactions,
    });
  } catch (error) {
    console.error("Verification confirmation error:", error);
    return NextResponse.json(
      { error: "Failed to verify. Please try again." },
      { status: 500 }
    );
  }
}
