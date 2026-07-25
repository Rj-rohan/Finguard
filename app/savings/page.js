"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PiggyBank, TrendingUp, Zap, Calendar } from "lucide-react";

function compound(monthly, years, rate = 0.08) {
  const r = rate / 12;
  const n = years * 12;
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

function fmt(n) { return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs" style={{ background: "#1A2438", border: "1px solid rgba(91,140,255,0.2)" }}>
      <div className="text-slate-400 mb-1">Year {label}</div>
      <div className="font-bold text-white">${fmt(payload[0]?.value || 0)}</div>
    </div>
  );
};

export default function Savings() {
  const [subs, setSubs] = useState([]);
  const [cancelled, setCancelled] = useState([]);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(8);

  useEffect(() => { fetch("/api/subscriptions").then((r) => r.json()).then(setSubs); }, []);

  const toggle = (id) => setCancelled((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const monthlySaving = subs.filter((s) => cancelled.includes(s.id)).reduce((sum, s) => sum + s.amount, 0);
  const annualSaving = monthlySaving * 12;
  const invested5 = compound(monthlySaving, 5, rate / 100);
  const invested10 = compound(monthlySaving, 10, rate / 100);
  const investedN = compound(monthlySaving, years, rate / 100);

  const chartData = Array.from({ length: years }, (_, i) => ({
    year: i + 1,
    value: parseFloat(compound(monthlySaving, i + 1, rate / 100).toFixed(2)),
  }));

  const stats = [
    { label: "Monthly Savings", value: `$${monthlySaving.toFixed(2)}`, icon: Zap, color: "#22C55E" },
    { label: "Annual Savings", value: `$${annualSaving.toFixed(2)}`, icon: Calendar, color: "#5B8CFF" },
    { label: "5-Year Growth", value: `$${fmt(invested5)}`, icon: TrendingUp, color: "#00D4FF" },
    { label: `${years}-Year Growth`, value: `$${fmt(investedN)}`, icon: PiggyBank, color: "#F59E0B" },
  ];

  return (
    <div className="space-y-5 fade-in">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Subscription toggles */}
        <div className="gradient-border p-5" style={{ background: "#151D2D", borderRadius: 16 }}>
          <div className="text-sm font-semibold text-white mb-1">Select to Cancel</div>
          <div className="text-xs text-slate-500 mb-4">Toggle subscriptions to see savings impact</div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {subs.map((s) => {
              const on = cancelled.includes(s.id);
              return (
                <label key={s.id} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${on ? "border" : "border"}`}
                  style={on
                    ? { background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.25)" }
                    : { background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${on ? "bg-green-500" : "border border-slate-600"}`}>
                      {on && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <input type="checkbox" checked={on} onChange={() => toggle(s.id)} className="hidden" />
                    <span className="text-sm text-white">{s.name}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-400">${s.amount}/mo</span>
                </label>
              );
            })}
            {subs.length === 0 && <p className="text-slate-600 text-sm text-center py-4">No subscriptions. Seed demo data first.</p>}
          </div>
        </div>

        {/* Controls + Stats */}
        <div className="space-y-4">
          <div className="gradient-border p-5" style={{ background: "#151D2D", borderRadius: 16 }}>
            <div className="text-sm font-semibold text-white mb-4">Simulation Settings</div>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Investment Period</span>
                  <span className="text-white font-semibold">{years} years</span>
                </div>
                <input type="range" min={1} max={30} value={years} onChange={(e) => setYears(+e.target.value)}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #5B8CFF ${(years / 30) * 100}%, rgba(255,255,255,0.1) 0%)` }} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Annual Return Rate</span>
                  <span className="text-white font-semibold">{rate}%</span>
                </div>
                <input type="range" min={1} max={20} value={rate} onChange={(e) => setRate(+e.target.value)}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #00D4FF ${(rate / 20) * 100}%, rgba(255,255,255,0.1) 0%)` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="p-4 rounded-2xl" style={{ background: "#151D2D", border: "1px solid rgba(255,255,255,0.05)" }}>
                <Icon size={14} className="mb-2" style={{ color }} />
                <div className="text-lg font-bold text-white">{value}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="gradient-border p-5" style={{ background: "#151D2D", borderRadius: 16 }}>
          <div className="text-sm font-semibold text-white mb-1">Investment Growth</div>
          <div className="text-xs text-slate-500 mb-4">If savings invested at {rate}% annually</div>
          {cancelled.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="year" stroke="transparent" tick={{ fill: "#475569", fontSize: 10 }} tickFormatter={(v) => `Y${v}`} />
                  <YAxis stroke="transparent" tick={{ fill: "#475569", fontSize: 10 }} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={2} fill="url(#areaGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 rounded-xl text-xs" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <div className="text-green-400 font-semibold mb-1">💰 {years}-Year Projection</div>
                <div className="text-slate-300">
                  Cancelling <strong className="text-white">{cancelled.length} service{cancelled.length > 1 ? "s" : ""}</strong> grows to{" "}
                  <strong className="text-green-400">${fmt(investedN)}</strong> in {years} years.
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <PiggyBank size={32} className="text-slate-700 mb-3" />
              <p className="text-slate-600 text-sm">Select subscriptions to cancel to see your investment growth</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
