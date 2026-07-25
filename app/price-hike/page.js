"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { TrendingUp, ArrowUpRight } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs" style={{ background: "#1A2438", border: "1px solid rgba(91,140,255,0.2)" }}>
      <div className="text-slate-400 mb-1">{label}</div>
      <div className="font-bold text-white">${payload[0]?.value}</div>
    </div>
  );
};

export default function PriceHike() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/price-history").then((r) => r.json()).then((d) => {
      setData(d); setSelected(d[0] || null); setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="space-y-5 fade-in">
      {data.length === 0 ? (
        <div className="text-center py-20">
          <TrendingUp size={40} className="mx-auto mb-3 text-slate-700" />
          <p className="text-slate-500">No price hike data. Seed the database first.</p>
        </div>
      ) : (
        <>
          {/* Service cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.map((s) => {
              const first = s.priceHistory[0]?.amount;
              const last = s.priceHistory[s.priceHistory.length - 1]?.amount;
              const isSelected = selected?.id === s.id;
              return (
                <button key={s.id} onClick={() => setSelected(s)}
                  className={`text-left p-5 rounded-2xl transition-all card-hover ${isSelected ? "glow-blue" : ""}`}
                  style={{
                    background: "#151D2D",
                    border: isSelected ? "1px solid rgba(91,140,255,0.4)" : "1px solid rgba(255,255,255,0.05)",
                  }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444" }}>
                      {s.name[0]}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-red-400">
                      <ArrowUpRight size={12} />
                      +{s.hikePercent}%
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">{s.name}</div>
                  <div className="text-xs text-slate-500">
                    <span className="text-slate-400">${first}</span>
                    <span className="mx-1.5 text-slate-700">→</span>
                    <span className="text-red-400 font-semibold">${last}</span>
                  </div>
                  <div className="mt-3 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="h-1 rounded-full bg-red-400" style={{ width: `${Math.min(s.hikePercent, 100)}%` }} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chart */}
          {selected && (
            <div className="gradient-border p-6 fade-in-2" style={{ background: "#151D2D", borderRadius: 16 }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-sm font-semibold text-white">{selected.name} — Price History</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Total increase: <span className="text-red-400 font-semibold">+{selected.hikePercent}%</span> since first recorded
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  ⚠ Price Hike Detected
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={selected.priceHistory.map((h) => ({
                  date: new Date(h.recordedAt).toLocaleDateString("en", { month: "short", year: "2-digit" }),
                  price: h.amount,
                }))}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#5B8CFF" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" stroke="transparent" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} />
                  <YAxis stroke="transparent" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="price" stroke="#EF4444" strokeWidth={2.5}
                    dot={{ fill: "#EF4444", r: 5, strokeWidth: 2, stroke: "#151D2D" }}
                    activeDot={{ r: 7, fill: "#EF4444" }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}>
                <span className="text-red-400 font-semibold">AI Recommendation: </span>
                <span className="text-slate-300">Consider negotiating a loyalty discount or switching to an annual plan to lock in current pricing.</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
