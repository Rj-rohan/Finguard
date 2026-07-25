"use client";
import { useEffect, useState } from "react";
import { TrendingDown, Copy, AlertTriangle, DollarSign, Zap } from "lucide-react";

export default function LeakScore() {
  const [data, setData] = useState(null);
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/leak-score").then((r) => r.json()),
      fetch("/api/subscriptions").then((r) => r.json()),
    ]).then(([d, s]) => { setData(d); setSubs(s); });
  }, []);

  if (!data) return (
    <div className="space-y-5 fade-in">
      <div className="skeleton h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    </div>
  );

  const scoreColor = data.score >= 80 ? "#22C55E" : data.score >= 50 ? "#F59E0B" : "#EF4444";
  const scoreLabel = data.score >= 80 ? "Excellent" : data.score >= 60 ? "Good" : data.score >= 40 ? "Needs Attention" : "Critical";
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (data.score / 100) * circumference;

  const unused = subs.filter((s) => s.lastUsed && new Date(s.lastUsed) < new Date(Date.now() - 30 * 86400000));
  const trials = subs.filter((s) => s.status === "trial");
  const wasted = unused.reduce((s, x) => s + x.amount, 0);

  const cards = [
    { label: "Unused Subscriptions", value: unused.length, sub: `$${wasted.toFixed(2)}/mo wasted`, icon: TrendingDown, color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)" },
    { label: "Active Trials", value: trials.length, sub: "about to charge", icon: AlertTriangle, color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
    { label: "Total Wasted", value: `$${wasted.toFixed(2)}`, sub: "per month", icon: DollarSign, color: "#EF4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)" },
    { label: "Potential Savings", value: `$${(wasted * 12).toFixed(0)}`, sub: "per year if cancelled", icon: Zap, color: "#22C55E", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)" },
  ];

  return (
    <div className="space-y-5 fade-in">
      {/* Main gauge */}
      <div className="gradient-border p-8 flex flex-col md:flex-row items-center gap-8" style={{ background: "#151D2D", borderRadius: 20 }}>
        <div className="relative shrink-0">
          <svg width="180" height="180" className="-rotate-90">
            <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            <circle cx="90" cy="90" r="70" fill="none" strokeWidth="12"
              strokeDasharray={circumference} strokeDashoffset={offset}
              strokeLinecap="round" style={{ stroke: scoreColor, transition: "stroke-dashoffset 1.5s ease", filter: `drop-shadow(0 0 8px ${scoreColor}66)` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-black" style={{ color: scoreColor }}>{data.score}</div>
            <div className="text-slate-500 text-sm">/ 100</div>
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="text-3xl font-bold text-white mb-1">{scoreLabel}</div>
          <div className="text-slate-400 mb-4">Your financial leak score based on subscription health</div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: `${scoreColor}15`, border: `1px solid ${scoreColor}30`, color: scoreColor }}>
            {data.score >= 80 ? "🎉 Great job! Keep it up." : data.score >= 60 ? "⚠️ A few things to improve." : "🚨 Immediate action recommended."}
          </div>
          <div className="mt-4 text-sm text-slate-500">Tracking <strong className="text-white">{data.total}</strong> subscriptions</div>
        </div>
        {/* Score breakdown */}
        <div className="shrink-0 space-y-2 min-w-[180px]">
          <div className="text-xs text-slate-600 uppercase tracking-widest mb-3">Score Breakdown</div>
          {[
            { label: "Unused subscriptions", penalty: "-8 pts each", color: "#EF4444" },
            { label: "Price increases", penalty: "-6 pts each", color: "#F59E0B" },
            { label: "Active trials", penalty: "-4 pts each", color: "#F59E0B" },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center text-xs">
              <span className="text-slate-400">{item.label}</span>
              <span className="font-semibold" style={{ color: item.color }}>{item.penalty}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, color, bg, border }) => (
          <div key={label} className="card-hover p-4 fade-in-2" style={{ background: "#151D2D", borderRadius: 16, border: `1px solid ${border}` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Issues */}
      {data.reasons.length > 0 && (
        <div className="gradient-border p-5 fade-in-3" style={{ background: "#151D2D", borderRadius: 16 }}>
          <div className="text-sm font-semibold text-white mb-4">Issues Detected</div>
          <div className="space-y-2">
            {data.reasons.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300 alert-high">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                {r}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unused list */}
      {unused.length > 0 && (
        <div className="gradient-border p-5 fade-in-4" style={{ background: "#151D2D", borderRadius: 16 }}>
          <div className="text-sm font-semibold text-white mb-4">Unused Subscriptions</div>
          <div className="space-y-2">
            {unused.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>{s.name[0]}</div>
                  <div>
                    <div className="text-sm font-medium text-white">{s.name}</div>
                    <div className="text-xs text-slate-500">Last used: {s.lastUsed ? new Date(s.lastUsed).toLocaleDateString() : "Never"}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-red-400">${s.amount}/mo</div>
                  <div className="text-[10px] text-slate-600">${(s.amount * 12).toFixed(0)}/yr</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
