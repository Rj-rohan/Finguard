import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const subs = await prisma.subscription.findMany();
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 86400000);
  const sixtyDaysAgo = new Date(now - 60 * 86400000);

  const unused = subs.filter((s) => s.lastUsed && new Date(s.lastUsed) < thirtyDaysAgo);
  const veryUnused = subs.filter((s) => s.lastUsed && new Date(s.lastUsed) < sixtyDaysAgo);
  const trials = subs.filter((s) => s.status === "trial");

  const priceHikes = await prisma.priceHistory.groupBy({
    by: ["subscriptionId"],
    _count: { subscriptionId: true },
    having: { subscriptionId: { _count: { gt: 1 } } },
  });

  let score = 100;
  score -= unused.length * 8;
  score -= veryUnused.length * 5;
  score -= priceHikes.length * 6;
  score -= trials.length * 4;

  const reasons = [];
  if (unused.length) reasons.push(`${unused.length} unused subscription(s)`);
  if (priceHikes.length) reasons.push(`${priceHikes.length} price increase(s) detected`);
  if (trials.length) reasons.push(`${trials.length} trial(s) about to charge`);

  return NextResponse.json({ score: Math.max(score, 0), reasons, total: subs.length });
}
