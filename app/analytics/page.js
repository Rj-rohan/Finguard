"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, Legend } from "recharts";

const COLORS = ["#5B8CFF", "#00D4FF", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs" style={{ background: "#1A2438", border: "1px solid rgba(91,140,255,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
      {label && <div className="text-slate-400 mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="font-semibold" style={{ color: p.color || "#fff" }}>${typeof p.value === "number" ? p.value.toFixed(2) : p.value}</div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [subs, setSubs] = useState([]);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/subscriptions").then((r) => r.json()), fetch("/api/transactions").then((r) => r.json())])
      .then(([s, t]) => { setSubs(s); setTxns(t); setLoading(false); });
  }, []);

  const byCategory = subs.reduce((acc, s) => { acc[s.category] = (acc[s.category] || 0) + s.amount; return acc; }, {});
  const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));

  const byMonth = txns.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleDateString("en", { month: "short" });
    acc[month] = (acc[month] || 0) + t.amount;
    return acc;
  }, {});
  const barData = Object.entries(byMonth).slice(-6).map(([month, amount]) => ({ month, amount: parseFloat(amount.toFixed(2)) }));

  const monthly = subs.reduce((s, x) => s + x.amount, 0);
  const maxCat = pieData.reduce((a, b) => (a.value > b.value ? a : b), { value: 0 });

  if (loading) return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      <div className="grid grid-cols-2 gap-4">{[...Array(2)].map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}</div>
    </div>
  );

  return (
    <div className="space-y-5 fade-in">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Monthly", value: `$${monthly.toFixed(2)}`, sub: "across all subscriptions", color: "#5B8CFF" },
          { label: "Top Category", value: maxCat.name || "—", sub: `$${maxCat.value?.toFixed(2) || 0}/mo`, color: "#00D4FF" },
          { label: "Transactions", value: txns.length, sub: "imported records", color: "#22C55E" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="gradient-border p-4 fade-in-1" style={{ background: "#151D2D", borderRadius: 16 }}>
            <div className="text-xs text-slate-500 mb-2">{label}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-[10px] mt-0.5" style={{ color }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="gradient-border p-5 fade-in-2" style={{ background: "#151D2D", borderRadius: 16 }}>
          <div className="text-sm font-semibold text-white mb-1">Subscriptions by Category</div>
          <div className="text-xs text-slate-500 mb-4">Monthly spend distribution</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={4}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map(({ name, value }, i) => (
              <div key={name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-slate-400 truncate">{name}</span>
                <span className="text-white font-medium ml-auto">${value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gradient-border p-5 fade-in-3" style={{ background: "#151D2D", borderRadius: 16 }}>
          <div className="text-sm font-semibold text-white mb-1">Monthly Transaction Spending</div>
          <div className="text-xs text-slate-500 mb-4">Last 6 months</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" stroke="transparent" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} />
              <YAxis stroke="transparent" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(91,140,255,0.05)" }} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="url(#barGrad2)" />
              <defs>
                <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4FF" />
                  <stop offset="100%" stopColor="#00D4FF" stopOpacity={0.3} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category breakdown bars */}
      <div className="gradient-border p-5 fade-in-4" style={{ background: "#151D2D", borderRadius: 16 }}>
        <div className="text-sm font-semibold text-white mb-4">Category Breakdown</div>
        <div className="space-y-3">
          {pieData.sort((a, b) => b.value - a.value).map(({ name, value }, i) => {
            const max = Math.max(...pieData.map((d) => d.value));
            const pct = (value / max) * 100;
            return (
              <div key={name} className="flex items-center gap-4">
                <span className="text-slate-400 text-sm w-28 shrink-0">{name}</span>
                <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-2 rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                </div>
                <span className="text-white text-sm font-medium w-20 text-right">${value}/mo</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
