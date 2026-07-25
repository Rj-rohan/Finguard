import prisma from "@/lib/prisma";
import { AlertTriangle, TrendingUp, CreditCard, DollarSign, Gauge, Zap, ArrowUpRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import DashboardCharts from "./DashboardCharts";

async function getData() {
  const [subs, alerts] = await Promise.all([
    prisma.subscription.findMany(),
    prisma.alert.findMany({ where: { read: false }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  let leakData = { score: 0, reasons: [] };
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/leak-score`, { cache: "no-store" });
    leakData = await res.json();
  } catch {}
  const monthly = subs.reduce((s, sub) => s + sub.amount, 0);
  const unused = subs.filter((s) => s.lastUsed && new Date(s.lastUsed) < new Date(Date.now() - 30 * 86400000));
  const upcoming = subs.filter((s) => new Date(s.nextPayment) <= new Date(Date.now() + 7 * 86400000));
  const savings = unused.reduce((s, sub) => s + sub.amount, 0);
  return { subs, alerts, monthly, unused, upcoming, savings, leakData };
}

export default async function Dashboard() {
  const { subs, alerts, monthly, unused, upcoming, savings, leakData } = await getData();

  if (subs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-6 fade-in">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
          style={{ background: "linear-gradient(135deg, rgba(91,140,255,0.15), rgba(0,212,255,0.1))", border: "1px solid rgba(91,140,255,0.2)" }}>
          ⚡
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to FinGuard AI</h1>
          <p className="text-slate-400 max-w-sm">Your database is empty. Seed it with demo data to explore all features.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/settings" className="btn-primary px-6 py-2.5 rounded-xl text-sm font-medium">Seed Demo Data</Link>
          <Link href="/subscriptions" className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-colors border border-white/10 hover:border-white/20">Add Manually</Link>
        </div>
      </div>
    );
  }

  const scoreColor = leakData.score >= 80 ? "#22C55E" : leakData.score >= 50 ? "#F59E0B" : "#EF4444";
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (leakData.score / 100) * circumference;

  const widgets = [
    { label: "Monthly Spend", value: `$${monthly.toFixed(2)}`, sub: "across all subscriptions", icon: DollarSign, color: "#5B8CFF", bg: "rgba(91,140,255,0.1)", border: "rgba(91,140,255,0.2)", delay: "fade-in-1" },
    { label: "Active Subscriptions", value: subs.length, sub: `${unused.length} unused`, icon: CreditCard, color: "#00D4FF", bg: "rgba(0,212,255,0.1)", border: "rgba(0,212,255,0.2)", delay: "fade-in-2" },
    { label: "Potential Savings", value: `$${savings.toFixed(2)}/mo`, sub: `$${(savings * 12).toFixed(0)}/year`, icon: Zap, color: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)", delay: "fade-in-3" },
    { label: "Upcoming (7 days)", value: upcoming.length, sub: "payments due soon", icon: TrendingUp, color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", delay: "fade-in-4" },
    { label: "Unused Services", value: unused.length, sub: `wasting $${unused.reduce((s, x) => s + x.amount, 0).toFixed(2)}/mo`, icon: AlertTriangle, color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", delay: "fade-in-5" },
  ];

  return (
    <div className="space-y-6 max-w-full">
      {/* Widgets row */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {widgets.map(({ label, value, sub, icon: Icon, color, bg, border, delay }) => (
          <div key={label} className={`gradient-border card-hover p-4 ${delay}`}
            style={{ background: "#151D2D", borderRadius: 16 }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg, border: `1px solid ${border}` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <ArrowUpRight size={14} className="text-slate-700" />
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts + Leak Score row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Charts */}
        <div className="xl:col-span-2 fade-in-2">
          <DashboardCharts subs={subs} />
        </div>

        {/* Leak Score */}
        <div className="gradient-border p-5 fade-in-3 flex flex-col" style={{ background: "#151D2D", borderRadius: 16 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-white">Leak Score</div>
              <div className="text-xs text-slate-500">Financial health rating</div>
            </div>
            <Link href="/leak-score" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Details <ArrowRight size={11} />
            </Link>
          </div>
          <div className="flex flex-col items-center flex-1 justify-center">
            <div className="relative">
              <svg width="120" height="120" className="-rotate-90">
                <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="60" cy="60" r="40" fill="none" strokeWidth="8"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" style={{ stroke: scoreColor, transition: "stroke-dashoffset 1.5s ease" }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold" style={{ color: scoreColor }}>{leakData.score}</div>
                <div className="text-[10px] text-slate-500">/ 100</div>
              </div>
            </div>
            <div className="text-sm font-semibold mt-3" style={{ color: scoreColor }}>
              {leakData.score >= 80 ? "Excellent" : leakData.score >= 60 ? "Good" : leakData.score >= 40 ? "Needs Attention" : "Critical"}
            </div>
            {leakData.reasons?.length > 0 && (
              <div className="mt-4 w-full space-y-2">
                {leakData.reasons.slice(0, 3).map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-400 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.1)" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts + Upcoming */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="gradient-border p-5 fade-in-4" style={{ background: "#151D2D", borderRadius: 16 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white">Recent Alerts</div>
            <Link href="/alerts" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">View all <ArrowRight size={11} /></Link>
          </div>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-600 text-sm">No new alerts</div>
          ) : (
            <div className="space-y-2">
              {alerts.map((a) => (
                <div key={a.id} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl text-xs alert-${a.severity}`}>
                  <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${a.severity === "high" ? "bg-red-400" : a.severity === "medium" ? "bg-yellow-400" : "bg-blue-400"}`} />
                  <span className="text-slate-300 leading-relaxed">{a.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="gradient-border p-5 fade-in-5" style={{ background: "#151D2D", borderRadius: 16 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white">Upcoming Payments</div>
            <Link href="/upcoming" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">View all <ArrowRight size={11} /></Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="text-center py-8 text-slate-600 text-sm">No payments in next 7 days</div>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 5).map((s) => {
                const days = Math.ceil((new Date(s.nextPayment) - Date.now()) / 86400000);
                return (
                  <div key={s.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg, rgba(91,140,255,0.2), rgba(0,212,255,0.1))" }}>
                        {s.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{s.name}</div>
                        <div className="text-[10px] text-slate-500">{days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold" style={{ color: days <= 1 ? "#EF4444" : days <= 3 ? "#F59E0B" : "#22C55E" }}>${s.amount}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* AI Recommendations */}
      {(leakData.reasons?.length > 0 || unused.length > 0) && (
        <div className="gradient-border p-5 fade-in-6" style={{ background: "#151D2D", borderRadius: 16 }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)" }}>
              <Gauge size={12} className="text-white" />
            </div>
            <div className="text-sm font-semibold text-white">AI Recommendations</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[...leakData.reasons?.map((r) => ({ text: r, color: "#5B8CFF", bg: "rgba(91,140,255,0.08)" })) || [],
              ...unused.slice(0, 3).map((s) => ({ text: `Cancel ${s.name} — save $${s.amount}/mo`, color: "#F59E0B", bg: "rgba(245,158,11,0.08)" }))
            ].slice(0, 6).map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-xs text-slate-300"
                style={{ background: item.bg, border: `1px solid ${item.color}22` }}>
                <span className="mt-0.5 shrink-0" style={{ color: item.color }}>→</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
