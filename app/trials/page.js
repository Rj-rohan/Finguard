"use client";
import { useEffect, useState } from "react";
import { Gift, AlertTriangle, Clock } from "lucide-react";

export default function Trials() {
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((r) => r.json())
      .then((data) => { setTrials(data.filter((s) => s.status === "trial" && s.trialEnd)); setLoading(false); });
  }, []);

  const daysLeft = (date) => Math.ceil((new Date(date) - Date.now()) / 86400000);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-5 fade-in">
      {trials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(91,140,255,0.1)", border: "1px solid rgba(91,140,255,0.2)" }}>
            <Gift size={28} style={{ color: "#5B8CFF" }} />
          </div>
          <div className="text-lg font-semibold text-white mb-1">No Active Trials</div>
          <p className="text-slate-500 text-sm">No free trials detected in your subscriptions</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {trials.map((s) => {
            const days = daysLeft(s.trialEnd);
            const urgent = days <= 3;
            const color = days <= 1 ? "#EF4444" : days <= 3 ? "#F59E0B" : "#22C55E";
            return (
              <div key={s.id} className="p-5 rounded-2xl card-hover fade-in-1"
                style={{ background: "#151D2D", border: `1px solid ${urgent ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.05)"}` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{ background: `${color}15`, border: `1px solid ${color}25`, color }}>
                    {s.name[0]}
                  </div>
                  {urgent && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 px-2.5 py-1 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <AlertTriangle size={11} /> Urgent
                    </div>
                  )}
                </div>
                <div className="text-base font-semibold text-white mb-3">{s.name}</div>
                <div className="flex items-end gap-2 mb-1">
                  <div className="text-4xl font-black" style={{ color }}>{days}</div>
                  <div className="text-slate-500 text-sm mb-1">day{days !== 1 ? "s" : ""} left</div>
                </div>
                <div className="h-1.5 rounded-full mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, (days / 14) * 100))}%`, background: color }} />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trial ends</span>
                    <span className="text-slate-300">{new Date(s.trialEnd).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Charge after trial</span>
                    <span className="text-white font-semibold">${s.amount}/mo</span>
                  </div>
                </div>
                {urgent && (
                  <div className="mt-3 p-2.5 rounded-xl text-xs text-red-300" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    ⚠ Cancel before {new Date(s.trialEnd).toLocaleDateString()} to avoid being charged
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
