"use client";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, TrendingUp, Copy, AlertTriangle, Clock, XCircle, Info } from "lucide-react";

const TYPE_META = {
  price_hike: { icon: TrendingUp, label: "Price Hike", color: "#EF4444" },
  duplicate: { icon: Copy, label: "Duplicate", color: "#F59E0B" },
  unused: { icon: AlertTriangle, label: "Unused", color: "#F59E0B" },
  trial_ending: { icon: Clock, label: "Trial Ending", color: "#EF4444" },
  payment_failed: { icon: XCircle, label: "Payment Failed", color: "#EF4444" },
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/alerts").then((r) => r.json()).then((d) => { setAlerts(d); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await fetch("/api/alerts", { method: "PATCH", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } });
    load();
  };

  const markAll = async () => {
    await Promise.all(alerts.filter((a) => !a.read).map((a) =>
      fetch("/api/alerts", { method: "PATCH", body: JSON.stringify({ id: a.id }), headers: { "Content-Type": "application/json" } })
    ));
    load();
  };

  const unread = alerts.filter((a) => !a.read).length;
  const filtered = filter === "all" ? alerts : filter === "unread" ? alerts.filter((a) => !a.read) : alerts.filter((a) => a.severity === filter);

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-white">Smart Alerts</div>
          {unread > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: "#EF4444" }}>{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "all", label: `All (${alerts.length})` },
          { id: "unread", label: `Unread (${unread})` },
          { id: "high", label: "High Priority" },
          { id: "medium", label: "Medium" },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setFilter(id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === id ? "text-white" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}
            style={filter === id ? { background: "linear-gradient(135deg, #5B8CFF, #4B7BEF)" } : {}}>
            {label}
          </button>
        ))}
      </div>

      {/* Alert cards */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const meta = TYPE_META[a.type] || { icon: Info, label: "Alert", color: "#5B8CFF" };
            const Icon = meta.icon;
            return (
              <div key={a.id}
                className={`flex items-start gap-4 p-4 rounded-2xl transition-all ${a.read ? "opacity-50" : ""} alert-${a.severity}`}
                style={{ background: "#151D2D", border: `1px solid rgba(255,255,255,0.05)` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}25` }}>
                  <Icon size={16} style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}25` }}>
                      {meta.label}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full badge-${a.severity}`}>{a.severity}</span>
                    {!a.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 pulse-dot" />}
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed">{a.message}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{new Date(a.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                {!a.read && (
                  <button onClick={() => markRead(a.id)}
                    className="text-xs text-slate-600 hover:text-blue-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-400/10 shrink-0">
                    Dismiss
                  </button>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Bell size={40} className="mx-auto mb-3 text-slate-700" />
              <p className="text-slate-500">No alerts in this category</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
