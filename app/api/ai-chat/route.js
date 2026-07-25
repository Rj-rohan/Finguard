import { NextResponse } from "next/server";
import { groqGenerate } from "@/lib/groq";
import prisma from "@/lib/prisma";

// Priority order for "keep" when prices are equal — more popular = keep
const PRIORITY = ["Spotify", "Netflix", "Google One", "Microsoft 365", "Amazon Prime"];

function pickCheapest(matches) {
  const sorted = [...matches].sort((a, b) => {
    if (a.amount !== b.amount) return a.amount - b.amount;
    const ai = PRIORITY.findIndex((p) => a.name.includes(p));
    const bi = PRIORITY.findIndex((p) => b.name.includes(p));
    if (ai !== -1 && bi === -1) return -1;
    if (bi !== -1 && ai === -1) return 1;
    return ai - bi;
  });
  return sorted[0];
}

function buildData(subs, priceHistory) {
  const now = Date.now();
  const monthly = subs.reduce((s, x) => s + x.amount, 0);
  const annual = monthly * 12;

  const unused = subs.filter(
    (s) => s.lastUsed && new Date(s.lastUsed) < new Date(now - 30 * 86400000)
  );
  const trials = subs.filter((s) => s.status === "trial" && s.trialEnd);

  const DUPLICATE_GROUPS = {
    "Music Streaming": ["Spotify", "YouTube Music", "Apple Music", "Amazon Music"],
    "Video Streaming": ["Netflix", "Disney+", "Hulu", "HBO Max", "Amazon Prime"],
    "Cloud Storage": ["Google One", "iCloud", "Dropbox", "OneDrive"],
    "Design Tools": ["Canva Pro", "Adobe Creative Cloud", "Figma"],
  };

  const duplicates = [];
  for (const [category, services] of Object.entries(DUPLICATE_GROUPS)) {
    const matches = subs.filter((s) =>
      services.some((svc) => s.name.toLowerCase().includes(svc.toLowerCase()))
    );
    if (matches.length > 1) {
      const cheapest = pickCheapest(matches);
      const waste = matches.filter((m) => m.id !== cheapest.id);
      duplicates.push({ category, matches, cheapest, waste });
    }
  }

  const hikes = [];
  for (const sub of subs) {
    const history = priceHistory.filter((h) => h.subscriptionId === sub.id);
    if (history.length >= 2) {
      const first = history[0].amount;
      const last = history[history.length - 1].amount;
      const pct = (((last - first) / first) * 100).toFixed(1);
      hikes.push({ name: sub.name, from: first, to: last, pct });
    }
  }

  const unusedSaving = unused.reduce((s, x) => s + x.amount, 0);
  const dupSaving = duplicates.reduce(
    (s, g) => s + g.waste.reduce((a, b) => a + b.amount, 0), 0
  );
  const totalSaving = unusedSaving + dupSaving;

  const r = 0.08 / 12;
  const invest5 = (unusedSaving * ((Math.pow(1 + r, 60) - 1) / r) * (1 + r)).toFixed(0);
  const invest10 = (unusedSaving * ((Math.pow(1 + r, 120) - 1) / r) * (1 + r)).toFixed(0);

  return { monthly, annual, unused, trials, duplicates, hikes, unusedSaving, dupSaving, totalSaving, invest5, invest10 };
}

function ruleBasedAnswer(q, subs, d) {
  const fmt = (n) => `$${parseFloat(n).toFixed(2)}`;

  // SPENDING — must be first to avoid collision with "save"
  if (q.match(/how much.*spend|how much.*cost|spending per|per month|per year|monthly.*spend|yearly|annual.*spend|how much i am|how much am i|total.*spend|spend.*month|spend.*year|i am spending|am i spending/)) {
    const top = [...subs].sort((a, b) => b.amount - a.amount).slice(0, 5);
    return `💳 **Monthly: ${fmt(d.monthly)}/month | Annual: ${fmt(d.annual)}/year**\n\n` +
      `Top 5 by cost:\n` +
      top.map((s, i) => `${i + 1}. ${s.name} — ${fmt(s.amount)}/mo`).join("\n") +
      `\n\n⚠️ ${fmt(d.unusedSaving)}/month of this is wasted on unused services.`;
  }

  // DUPLICATES
  if (q.match(/duplic|same service|overlap|multiple music|multiple stream/)) {
    if (d.duplicates.length === 0) return "✅ No duplicate services found!";
    return d.duplicates.map((g) =>
      `🔁 **${g.category}:** ${g.matches.map((m) => `${m.name} (${fmt(m.amount)}/mo)`).join(", ")}\n→ Keep **${g.cheapest.name}**. Cancel the rest → save **${fmt(g.waste.reduce((a, b) => a + b.amount, 0))}/month**.`
    ).join("\n\n") + `\n\n💰 Total duplicate waste: **${fmt(d.dupSaving)}/month**.`;
  }

  // WASTING / UNUSED
  if (q.match(/wast|unused|not using|inactive|useless/)) {
    if (d.unused.length === 0) return "✅ No unused subscriptions detected. You're using everything you pay for!";
    return `🚨 You're wasting **${fmt(d.unusedSaving)}/month** on ${d.unused.length} unused services:\n\n` +
      d.unused.map((s) => `• **${s.name}** — ${fmt(s.amount)}/mo (last used: ${s.lastUsed ? new Date(s.lastUsed).toLocaleDateString() : "never"})`).join("\n") +
      `\n\n→ Cancel all to save **${fmt(d.unusedSaving * 12)}/year**.`;
  }

  // WHICH TO CANCEL
  if (q.match(/which.*cancel|should.*cancel|recommend.*cancel|what.*cancel|cancel.*which|what should i/)) {
    const cancelList = [
      ...d.unused,
      ...d.duplicates.flatMap((g) => g.waste),
    ];
    const unique = [...new Map(cancelList.map((s) => [s.id, s])).values()];
    const totalSave = unique.reduce((s, x) => s + x.amount, 0);
    return `🗑️ **Cancel these ${unique.length} subscriptions:**\n\n` +
      unique.map((s) => {
        const isUnused = d.unused.find((u) => u.id === s.id);
        const isDup = d.duplicates.find((g) => g.waste.find((w) => w.id === s.id));
        const reason = isUnused && isDup ? "unused + duplicate" : isUnused ? "unused 30+ days" : "duplicate service";
        return `• **${s.name}** — ${fmt(s.amount)}/mo (${reason})`;
      }).join("\n") +
      `\n\n💰 Total saving: **${fmt(totalSave)}/month = ${fmt(totalSave * 12)}/year**`;
  }

  // SAVINGS — this month vs this year
  if (q.match(/how much.*save|if i cancel|cancel all|saving.*year|annual saving|potential saving|how to save|save.*year/)) {
    const isMonth = q.match(/this month|per month|each month|monthly/);
    if (isMonth) {
      return `💰 **You can save ${fmt(d.totalSaving)} this month** by:\n\n` +
        `• Cancel ${d.unused.length} unused services → **${fmt(d.unusedSaving)}/month**\n` +
        `• Cancel duplicate services → **${fmt(d.dupSaving)}/month**\n\n` +
        `That's **${fmt(d.totalSaving * 12)}/year** — invested at 8% for 10 years → **$${parseInt(d.invest10).toLocaleString()}** 🚀`;
    }
    return `💰 **Full savings breakdown:**\n\n` +
      `• Cancel ${d.unused.length} unused services → **${fmt(d.unusedSaving)}/month** (${fmt(d.unusedSaving * 12)}/year)\n` +
      `• Cancel duplicate services → **${fmt(d.dupSaving)}/month** (${fmt(d.dupSaving * 12)}/year)\n` +
      `• **Total: ${fmt(d.totalSaving)}/month = ${fmt(d.totalSaving * 12)}/year**\n\n` +
      `📈 Invest ${fmt(d.unusedSaving)}/month at 8%:\n• 5 years → **$${parseInt(d.invest5).toLocaleString()}**\n• 10 years → **$${parseInt(d.invest10).toLocaleString()}**`;
  }

  // INVEST
  if (q.match(/invest|compound|grow|future|10 year|5 year|wealth/)) {
    return `📈 Invest **${fmt(d.unusedSaving)}/month** (your unused subscription waste) at 8%:\n\n• After 5 years → **$${parseInt(d.invest5).toLocaleString()}**\n• After 10 years → **$${parseInt(d.invest10).toLocaleString()}**\n\nTurning wasted subscriptions into real wealth! 🚀`;
  }

  // PRICE HIKE
  if (q.match(/price|hike|increase|expensive|raised|went up/)) {
    if (d.hikes.length === 0) return "✅ No price hikes detected on your subscriptions.";
    return `📈 Price hikes detected:\n\n` +
      d.hikes.map((h) => `• **${h.name}**: $${h.from} → $${h.to}/mo (+${h.pct}%)`).join("\n");
  }

  // TRIALS
  if (q.match(/trial|free trial|charging soon/)) {
    if (d.trials.length === 0) return "✅ No active trials detected.";
    return `⏰ **${d.trials.length} trial(s) about to charge:**\n\n` +
      d.trials.map((t) => {
        const days = Math.ceil((new Date(t.trialEnd) - Date.now()) / 86400000);
        return `• **${t.name}** — $${t.amount}/mo, ends in **${days} day(s)** (${new Date(t.trialEnd).toLocaleDateString()})`;
      }).join("\n") +
      `\n\n⚠️ Cancel before the trial ends to avoid being charged!`;
  }

  // SUMMARY
  if (q.match(/summary|overview|health|everything|full report|analyze|tell me about/)) {
    return `📊 **Your Financial Health Summary:**\n\n` +
      `• Total subscriptions: **${subs.length}** costing **${fmt(d.monthly)}/month**\n` +
      `• Unused services: **${d.unused.length}** (wasting ${fmt(d.unusedSaving)}/mo)\n` +
      `• Duplicate groups: **${d.duplicates.length}** (wasting ${fmt(d.dupSaving)}/mo)\n` +
      `• Price hikes: **${d.hikes.length}** detected\n` +
      `• Trials about to charge: **${d.trials.length}**\n\n` +
      `💰 **Total you could save: ${fmt(d.totalSaving)}/month = ${fmt(d.totalSaving * 12)}/year**\n` +
      `📈 Invested over 10 years at 8% → **$${parseInt(d.invest10).toLocaleString()}**`;
  }

  return null; // Let Groq handle it
}

export async function POST(req) {
  const { message } = await req.json();

  const [subs, priceHistory] = await Promise.all([
    prisma.subscription.findMany(),
    prisma.priceHistory.findMany({ orderBy: { recordedAt: "asc" } }),
  ]);

  const d = buildData(subs, priceHistory);
  const q = message.toLowerCase();

  const ruleAnswer = ruleBasedAnswer(q, subs, d);
  if (ruleAnswer) return NextResponse.json({ reply: ruleAnswer });

  const prompt = `You are LeakZero AI, a financial advisor for a subscription tracking app.
Answer ONLY the user's specific question. Be concise (max 5 lines). Use exact numbers from the data.

DATA:
- ${subs.length} subscriptions, $${d.monthly.toFixed(2)}/month, $${d.annual.toFixed(2)}/year
- Unused (30+ days): ${d.unused.map((s) => `${s.name} ($${s.amount}/mo)`).join(", ") || "none"}
- Duplicates: ${d.duplicates.map((g) => `${g.category}: keep ${g.cheapest.name}, cancel ${g.waste.map((w) => w.name).join("+")}`).join(" | ") || "none"}
- Price hikes: ${d.hikes.map((h) => `${h.name} +${h.pct}%`).join(", ") || "none"}
- Trials: ${d.trials.map((t) => t.name).join(", ") || "none"}
- Potential saving: $${d.totalSaving.toFixed(2)}/month

QUESTION: "${message}"`;

  try {
    const reply = await groqGenerate(prompt);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({
      reply: `You have **${subs.length} subscriptions** costing **$${d.monthly.toFixed(2)}/month**. You could save **$${d.totalSaving.toFixed(2)}/month** by cancelling unused and duplicate services. Ask me anything specific!`,
    });
  }
}
