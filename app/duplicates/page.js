"use client";
import { useEffect, useState } from "react";
import { Copy, CheckCircle, X, Check } from "lucide-react";

const DUPLICATE_GROUPS = {
  "Music Streaming": ["Spotify", "YouTube Music", "Apple Music", "Amazon Music"],
  "Video Streaming": ["Netflix", "Disney+", "Hulu", "HBO Max", "Amazon Prime"],
  "Cloud Storage": ["Google One", "iCloud", "Dropbox", "OneDrive"],
  "Design Tools": ["Canva Pro", "Adobe Creative Cloud", "Figma"],
  "Office Suite": ["Microsoft 365", "Google Workspace"],
};

export default function Duplicates() {
  const [subs, setSubs] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subscriptions").then((r) => r.json()).then((data) => {
      setSubs(data);
      const found = [];
      for (const [category, services] of Object.entries(DUPLICATE_GROUPS)) {
        const matches = data.filter((s) => services.some((svc) => s.name.toLowerCase().includes(svc.toLowerCase())));
        if (matches.length > 1) found.push({ category, matches });
      }
      setGroups(found);
      setLoading(false);
    });
  }, []);

  const cheapest = (matches) => matches.reduce((a, b) => (a.amount < b.amount ? a : b));
  const totalSavings = groups.reduce((sum, { matches }) => {
    const keep = cheapest(matches);
    return sum + matches.filter((m) => m.id !== keep.id).reduce((s, m) => s + m.amount, 0);
  }, 0);

  if (loading) return <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-5 fade-in">
      {/* Summary */}
      {groups.length > 0 && (
        <div className="p-4 rounded-2xl flex items-center gap-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.15)" }}>
            <Copy size={18} className="text-red-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{groups.length} duplicate group{groups.length > 1 ? "s" : ""} detected</div>
            <div className="text-xs text-slate-400 mt-0.5">You could save <span className="text-red-400 font-semibold">${totalSavings.toFixed(2)}/month</span> by keeping only the cheapest option</div>
          </div>
        </div>
      )}

      {groups.length === 0 && subs.length > 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <CheckCircle size={28} className="text-green-400" />
          </div>
          <div className="text-lg font-semibold text-white mb-1">No Duplicates Found!</div>
          <p className="text-slate-500 text-sm">Your subscriptions look clean — no overlapping services detected</p>
        </div>
      )}

      {groups.map(({ category, matches }) => {
        const keep = cheapest(matches);
        const cancel = matches.filter((m) => m.id !== keep.id);
        const saving = cancel.reduce((s, m) => s + m.amount, 0);
        return (
          <div key={category} className="gradient-border p-5 fade-in-1" style={{ background: "#151D2D", borderRadius: 16 }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <Copy size={14} className="text-yellow-400" />
                </div>
                <div className="text-sm font-semibold text-white">{category}</div>
              </div>
              <div className="text-xs font-semibold text-red-400 px-3 py-1 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                Save ${saving.toFixed(2)}/mo
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {matches.map((s) => {
                const isKeep = s.id === keep.id;
                return (
                  <div key={s.id} className="p-4 rounded-xl transition-all"
                    style={isKeep
                      ? { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }
                      : { background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={isKeep ? { background: "rgba(34,197,94,0.2)", color: "#22C55E" } : { background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>
                        {s.name[0]}
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isKeep ? "bg-green-500" : "bg-red-500/20"}`}>
                        {isKeep ? <Check size={12} className="text-white" /> : <X size={12} className="text-red-400" />}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-white">{s.name}</div>
                    <div className="text-base font-bold mt-1" style={{ color: isKeep ? "#22C55E" : "#EF4444" }}>${s.amount}/mo</div>
                    <div className={`text-[10px] font-semibold mt-2 ${isKeep ? "text-green-400" : "text-red-400"}`}>
                      {isKeep ? "✓ Keep (cheapest)" : "✗ Consider cancelling"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {subs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500">No subscriptions found. <a href="/settings" className="text-blue-400 hover:underline">Seed demo data →</a></p>
        </div>
      )}
    </div>
  );
}
