import { NextResponse } from "next/server";
import { db } from "@/db";
import { waitlist, transactions } from "@/db/schema";
import { count, sql } from "drizzle-orm";

export async function GET() {
  try {
    const [waitlistCount] = await db.select({ count: count() }).from(waitlist);
    const [transactionCount] = await db.select({ count: count() }).from(transactions);
    
    const totalSales = await db.select({ total: sql`COALESCE(SUM(${transactions.total}), 0)` }).from(transactions).where(sql`${transactions.type} = 'SALE'`);
    const totalPurchases = await db.select({ total: sql`COALESCE(SUM(${transactions.total}), 0)` }).from(transactions).where(sql`${transactions.type} = 'PURCHASE'`);

    return NextResponse.json({
      waitlistCount: waitlistCount.count,
      transactionCount: transactionCount.count,
      totalSales: totalSales[0]?.total || 0,
      totalPurchases: totalPurchases[0]?.total || 0,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { waitlistCount: 0, transactionCount: 0, totalSales: 0, totalPurchases: 0 },
      { status: 200 }
    );
  }
}
