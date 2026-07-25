import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const subs = await prisma.subscription.findMany();
  const history = await prisma.priceHistory.findMany({ orderBy: { recordedAt: "asc" } });

  const result = subs.map((sub) => {
    const prices = history.filter((h) => h.subscriptionId === sub.id);
    if (prices.length < 2) return null;
    const first = prices[0].amount;
    const last = prices[prices.length - 1].amount;
    const hike = (((last - first) / first) * 100).toFixed(1);
    return { ...sub, priceHistory: prices, hikePercent: parseFloat(hike) };
  }).filter(Boolean);

  return NextResponse.json(result);
}
