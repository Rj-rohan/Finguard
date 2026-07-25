import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const { message } = await req.json();

  const subs = await prisma.subscription.findMany();
  const now = new Date();
  const unused = subs.filter((s) => s.lastUsed && new Date(s.lastUsed) < new Date(now - 30 * 86400000));
  const monthly = subs.reduce((s, x) => s + x.amount, 0);

  const context = `You are LeakZero AI, a financial advisor specializing in subscription management.
User's data:
- Total subscriptions: ${subs.length}
- Monthly spend: $${monthly.toFixed(2)}
- Unused (30+ days): ${unused.map((s) => `${s.name} ($${s.amount}/mo)`).join(", ") || "none"}
- All subscriptions: ${subs.map((s) => `${s.name} $${s.amount}/mo (${s.status})`).join(", ")}
Be concise, helpful, specific to their data. Keep responses under 150 words. Use **bold** for emphasis.`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("No API key");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`${context}\n\nUser: ${message}`);
    return NextResponse.json({ reply: result.response.text() });
  } catch {
    const q = message.toLowerCase();
    let reply = `You have **${subs.length} subscriptions** costing **$${monthly.toFixed(2)}/month**.`;
    if (unused.length) reply += ` **${unused.length} unused**: ${unused.map((s) => s.name).join(", ")}.`;

    if (q.includes("wast") || q.includes("unused")) {
      reply = unused.length > 0
        ? `You're wasting **$${unused.reduce((s, x) => s + x.amount, 0).toFixed(2)}/month** on: **${unused.map((s) => s.name).join(", ")}**.`
        : "No unused subscriptions — great job!";
    } else if (q.includes("save") || q.includes("saving")) {
      const saving = unused.reduce((s, x) => s + x.amount, 0);
      reply = `Cancel unused services to save **$${saving.toFixed(2)}/month** — **$${(saving * 12).toFixed(2)}/year**.`;
    } else if (q.includes("cancel") || q.includes("email")) {
      reply = "Use the **Email Generator** on the right to create cancellation, downgrade, or negotiation emails instantly.";
    } else if (q.includes("expensive") || q.includes("most")) {
      const top = [...subs].sort((a, b) => b.amount - a.amount)[0];
      reply = top ? `Your most expensive subscription is **${top.name}** at **$${top.amount}/month**.` : "No subscriptions found.";
    }
    return NextResponse.json({ reply });
  }
}
