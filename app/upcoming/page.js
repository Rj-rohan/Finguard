"use client";
import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

export default function Upcoming() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/subscriptions").then((r) => r.json()).then((d) => { setSubs(d); setLoading(false); }); }, []);

  const sorted = [...subs].sort((a, b) => new Date(a.nextPayment) - new Date(b.nextPayment));
  const now = new Date();

  const label = (date) => {
    const d = new Date(date);
    const diff = Math.ceil((d - now) / 86400000);
    if (diff <= 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff <= 7) return d.toLocaleDateString("en", { weekday: "long" });
    return d.toLocaleDateString("en", { month: "short", day: "numeric" });
  };

  const urgencyColor = (date) => {
    const diff = Math.ceil((new Date(date) - now) / 86400000);
    if (diff <= 1) return "#EF4444";
    if (diff <= 3) return "#F59E0B";
    return "#22C55E";
  };

  const groups = sorted.reduce((acc, s) => {
    const key = label(s.nextPayment);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const totalUpcoming7 = subs.filter((s) => new Date(s.nextPayment) <= new Date(Date.now() + 7 * 86400000)).reduce((s, x) => s + x.amount, 0);

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-5 fade-in">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Due This Week", value: `$${totalUpcoming7.toFixed(2)}`, color: "#EF4444" },
          { label: "Total Subscriptions", value: subs.length, color: "#5B8CFF" },
          { label: "Next Payment", value: sorted[0] ? `$${sorted[0].amount}` : "—", color: "#22C55E" },
        ].map(({ label, value, color }) => (
          <div key={label} className="gradient-border p-4" style={{ background: "#151D2D", borderRadius: 16 }}>
            <div className="text-xs text-slate-500 mb-1">{label}</div>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-500">
        {[["#EF4444", "Due today/tomorrow"], ["#F59E0B", "Due in 3 days"], ["#22C55E", "Upcoming"]].map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: c }} />
            {l}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-5">
        {Object.entries(groups).map(([day, items]) => (
          <div key={day} className="fade-in-1">
            <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mb-2 px-1">{day}</div>
            <div className="space-y-2">
              {items.map((s) => {
                const color = urgencyColor(s.nextPayment);
                const diff = Math.ceil((new Date(s.nextPayment) - now) / 86400000);
                return (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3.5 rounded-2xl card-hover"
                    style={{ background: "#151D2D", border: `1px solid rgba(255,255,255,0.05)`, borderLeft: `3px solid ${color}` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={{ background: `${color}15`, color }}>
                        {s.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{s.name}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{s.frequency} · {s.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold" style={{ color }}>${s.amount}</div>
                      <div className="text-[10px] text-slate-600">{new Date(s.nextPayment).toLocaleDateString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {subs.length === 0 && (
        <div className="text-center py-16">
          <CalendarDays size={40} className="mx-auto mb-3 text-slate-700" />
          <p className="text-slate-500">No upcoming payments. Seed demo data first.</p>
        </div>
      )}
    </div>
  );
}
