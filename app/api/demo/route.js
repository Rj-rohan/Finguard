import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export const runtime = "nodejs";

const DEMO_EMAIL = "demo@finguard.ai";
const DEMO_PASS = "Demo@1234";
const DEMO_NAME = "Alex Johnson";

export async function POST() {
  try {
    let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    if (!user) {
      const hashed = await bcrypt.hash(DEMO_PASS, 10);
      user = await prisma.user.create({
        data: { name: DEMO_NAME, email: DEMO_EMAIL, password: hashed },
      });
    }

    await prisma.alert.deleteMany();
    await prisma.priceHistory.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.transaction.deleteMany();

    const now = new Date();
    const d = (days) => new Date(now.getTime() + days * 86400000);

    await prisma.subscription.createMany({
      data: [
        { name: "Netflix", amount: 15.99, frequency: "monthly", nextPayment: d(5), category: "Entertainment", status: "active", lastUsed: d(-2) },
        { name: "Spotify", amount: 9.99, frequency: "monthly", nextPayment: d(8), category: "Entertainment", status: "active", lastUsed: d(-1) },
        { name: "Adobe Creative Cloud", amount: 54.99, frequency: "monthly", nextPayment: d(12), category: "Productivity", status: "active", lastUsed: d(-45) },
        { name: "Canva Pro", amount: 12.99, frequency: "monthly", nextPayment: d(3), category: "Productivity", status: "active", lastUsed: d(-62) },
        { name: "YouTube Music", amount: 9.99, frequency: "monthly", nextPayment: d(10), category: "Entertainment", status: "active", lastUsed: d(-30) },
        { name: "Apple Music", amount: 10.99, frequency: "monthly", nextPayment: d(15), category: "Entertainment", status: "active", lastUsed: d(-90) },
        { name: "AWS", amount: 23.50, frequency: "monthly", nextPayment: d(2), category: "Cloud", status: "active", lastUsed: d(-1) },
        { name: "Google One", amount: 2.99, frequency: "monthly", nextPayment: d(20), category: "Cloud", status: "active", lastUsed: d(-5) },
        { name: "Microsoft 365", amount: 9.99, frequency: "monthly", nextPayment: d(18), category: "Productivity", status: "active", lastUsed: d(-3) },
        { name: "Amazon Prime", amount: 14.99, frequency: "monthly", nextPayment: d(3), category: "Shopping", status: "trial", trialEnd: d(3), lastUsed: d(-10) },
        { name: "GitHub Copilot", amount: 10.00, frequency: "monthly", nextPayment: d(7), category: "Productivity", status: "active", lastUsed: d(-1) },
        { name: "Notion", amount: 8.00, frequency: "monthly", nextPayment: d(14), category: "Productivity", status: "active", lastUsed: d(-4) },
      ],
    });

    const subs = await prisma.subscription.findMany();
    const netflix = subs.find((s) => s.name === "Netflix");
    const adobe = subs.find((s) => s.name === "Adobe Creative Cloud");
    const spotify = subs.find((s) => s.name === "Spotify");

    await prisma.priceHistory.createMany({
      data: [
        { subscriptionId: netflix.id, amount: 12.0, recordedAt: new Date("2024-01-01") },
        { subscriptionId: netflix.id, amount: 13.99, recordedAt: new Date("2024-04-01") },
        { subscriptionId: netflix.id, amount: 15.99, recordedAt: new Date("2024-10-01") },
        { subscriptionId: adobe.id, amount: 49.99, recordedAt: new Date("2024-01-01") },
        { subscriptionId: adobe.id, amount: 54.99, recordedAt: new Date("2024-07-01") },
        { subscriptionId: spotify.id, amount: 7.99, recordedAt: new Date("2024-01-01") },
        { subscriptionId: spotify.id, amount: 9.99, recordedAt: new Date("2024-06-01") },
      ],
    });

    const merchants = ["Netflix", "Spotify", "Adobe", "Canva", "AWS", "Google", "Amazon", "Uber Eats", "Swiggy", "Steam", "Apple", "Microsoft"];
    const categories = ["Entertainment", "Productivity", "Cloud", "Food", "Gaming", "Shopping"];
    const txns = [];
    for (let i = 0; i < 60; i++) {
      txns.push({
        merchant: merchants[i % merchants.length],
        amount: parseFloat((Math.random() * 80 + 5).toFixed(2)),
        date: d(-i * 2),
        category: categories[i % categories.length],
        source: "manual",
        isRecurring: i % 4 === 0,
      });
    }
    await prisma.transaction.createMany({ data: txns });

    await prisma.alert.createMany({
      data: [
        { type: "price_hike", message: "Netflix increased price by 33% since Jan 2024", severity: "high" },
        { type: "duplicate", message: "You have 3 music streaming services: Spotify, YouTube Music, Apple Music", severity: "high" },
        { type: "unused", message: "Canva Pro unused for 62 days — consider cancelling", severity: "medium" },
        { type: "trial_ending", message: "Amazon Prime trial ends in 3 days — $14.99 charge incoming", severity: "high" },
        { type: "unused", message: "Adobe Creative Cloud unused for 45 days", severity: "medium" },
        { type: "price_hike", message: "Spotify increased price by 25% since Jan 2024", severity: "medium" },
      ],
    });

    const token = await signToken({ id: user.id, name: user.name, email: user.email });

    const res = NextResponse.json({
      ok: true,
      message: "Demo account ready",
      credentials: { email: DEMO_EMAIL, password: DEMO_PASS },
    });
    res.cookies.set("fg_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("[demo]", e);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
