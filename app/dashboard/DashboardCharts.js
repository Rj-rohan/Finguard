"use client";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const COLORS = ["#5B8CFF", "#00D4FF", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs" style={{ background: "#1A2438", border: "1px solid rgba(91,140,255,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
      {label && <div className="text-slate-400 mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="font-semibold text-white">${typeof p.value === "number" ? p.value.toFixed(2) : p.value}</div>
      ))}
    </div>
  );
};

export default function DashboardCharts({ subs }) {
  const byCategory = subs.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + s.amount;
    return acc;
  }, {});
  const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));

  const monthly = subs.reduce((acc, s) => {
    const m = new Date(s.nextPayment).toLocaleDateString("en", { month: "short" });
    acc[m] = (acc[m] || 0) + s.amount;
    return acc;
  }, {});
  const barData = Object.entries(monthly).slice(0, 6).map(([month, amount]) => ({ month, amount: parseFloat(amount.toFixed(2)) }));

  return (
    <div className="gradient-border h-full" style={{ background: "#151D2D", borderRadius: 16 }}>
      <div className="p-5">
        <div className="text-sm font-semibold text-white mb-1">Spending Overview</div>
        <div className="text-xs text-slate-500 mb-5">Category breakdown & monthly trend</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie */}
          <div>
            <div className="text-xs text-slate-600 uppercase tracking-widest mb-3">By Category</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {pieData.slice(0, 4).map(({ name, value }, i) => (
                <div key={name} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-400 flex-1 truncate">{name}</span>
                  <span className="text-white font-medium">${value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar */}
          <div>
            <div className="text-xs text-slate-600 uppercase tracking-widest mb-3">Monthly Trend</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" stroke="transparent" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} />
                <YAxis stroke="transparent" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(91,140,255,0.05)" }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}
                  fill="url(#barGrad)" />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5B8CFF" />
                    <stop offset="100%" stopColor="#5B8CFF" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
