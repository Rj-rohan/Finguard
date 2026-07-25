"use client";
import { useEffect, useState } from "react";
import { Download, FileText, TrendingDown, DollarSign, Zap, AlertTriangle } from "lucide-react";

export default function Reports() {
  const [subs, setSubs] = useState([]);
  const [score, setScore] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/subscriptions").then((r) => r.json()), fetch("/api/leak-score").then((r) => r.json())])
      .then(([s, sc]) => { setSubs(s); setScore(sc); });
  }, []);

  const monthly = subs.reduce((s, x) => s + x.amount, 0);
  const unused = subs.filter((s) => s.lastUsed && new Date(s.lastUsed) < new Date(Date.now() - 30 * 86400000));
  const savings = unused.reduce((s, x) => s + x.amount, 0);

  const downloadPDF = async () => {
    setDownloading(true);
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFillColor(11, 18, 32);
    doc.rect(0, 0, 210, 297, "F");
    doc.setTextColor(91, 140, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("FinGuard AI", 14, 22);
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Monthly Financial Health Report", 14, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 37);
    doc.setDrawColor(30, 42, 64);
    doc.line(14, 43, 196, 43);
    const stats = [["Leak Score", `${score?.score ?? "N/A"}/100`], ["Subscriptions", String(subs.length)], ["Monthly Spend", `$${monthly.toFixed(2)}`], ["Potential Savings", `$${savings.toFixed(2)}/mo`], ["Annual Savings", `$${(savings * 12).toFixed(2)}`]];
    doc.setFontSize(14); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.text("Summary", 14, 55);
    stats.forEach(([l, v], i) => {
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(156, 163, 175); doc.text(l, 14, 65 + i * 9);
      doc.setTextColor(255, 255, 255); doc.text(v, 100, 65 + i * 9);
    });
    doc.line(14, 115, 196, 115);
    doc.setFontSize(14); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.text("Subscriptions", 14, 127);
    [...subs].sort((a, b) => b.amount - a.amount).forEach((s, i) => {
      if (127 + 10 + i * 8 > 270) return;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(209, 213, 219); doc.text(s.name, 14, 137 + i * 8);
      doc.setTextColor(91, 140, 255); doc.text(`$${s.amount}/mo`, 110, 137 + i * 8);
      doc.setTextColor(s.status === "active" ? 34 : 245, s.status === "active" ? 197 : 158, s.status === "active" ? 94 : 11);
      doc.text(s.status, 160, 137 + i * 8);
    });
    if (score?.reasons?.length) {
      const y = 137 + Math.min(subs.length, 15) * 8 + 12;
      if (y < 260) {
        doc.setFontSize(14); doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.text("AI Recommendations", 14, y);
        score.reasons.forEach((r, i) => { doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(209, 213, 219); doc.text(`• ${r}`, 14, y + 10 + i * 8); });
      }
    }
    doc.save("finguard-report.pdf");
    setDownloading(false);
  };

  const statCards = [
    { label: "Leak Score", value: `${score?.score ?? "—"}/100`, icon: AlertTriangle, color: "#EF4444" },
    { label: "Monthly Spend", value: `$${monthly.toFixed(2)}`, icon: DollarSign, color: "#5B8CFF" },
    { label: "Potential Savings", value: `$${savings.toFixed(2)}/mo`, icon: Zap, color: "#22C55E" },
    { label: "Annual Savings", value: `$${(savings * 12).toFixed(2)}`, icon: TrendingDown, color: "#F59E0B" },
  ];

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(91,140,255,0.1)", border: "1px solid rgba(91,140,255,0.2)" }}>
            <FileText size={16} style={{ color: "#5B8CFF" }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Monthly Financial Health Report</div>
            <div className="text-xs text-slate-500">Generated {new Date().toLocaleDateString()}</div>
          </div>
        </div>
        <button onClick={downloadPDF} disabled={downloading}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
          <Download size={15} /> {downloading ? "Generating..." : "Download PDF"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="gradient-border p-4 fade-in-1" style={{ background: "#151D2D", borderRadius: 16 }}>
            <Icon size={14} className="mb-2" style={{ color }} />
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="gradient-border p-5 fade-in-2" style={{ background: "#151D2D", borderRadius: 16 }}>
        <div className="text-sm font-semibold text-white mb-4">Top Spending</div>
        <div className="space-y-2">
          {[...subs].sort((a, b) => b.amount - a.amount).slice(0, 8).map((s, i) => {
            const max = subs.reduce((m, x) => Math.max(m, x.amount), 0);
            return (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-4">{i + 1}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "rgba(91,140,255,0.1)", color: "#5B8CFF" }}>{s.name[0]}</div>
                <span className="text-sm text-slate-300 flex-1">{s.name}</span>
                <div className="w-32 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-1.5 rounded-full progress-bar" style={{ width: `${(s.amount / max) * 100}%` }} />
                </div>
                <span className="text-sm font-semibold text-white w-16 text-right">${s.amount}/mo</span>
              </div>
            );
          })}
        </div>
      </div>

      {unused.length > 0 && (
        <div className="gradient-border p-5 fade-in-3" style={{ background: "#151D2D", borderRadius: 16 }}>
          <div className="text-sm font-semibold text-white mb-4">Unused Subscriptions</div>
          <div className="space-y-2">
            {unused.map((s) => (
              <div key={s.id} className="flex justify-between items-center px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                <span className="text-yellow-200">{s.name}</span>
                <span className="text-yellow-400 font-medium">${s.amount}/mo — consider cancelling</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {score?.reasons?.length > 0 && (
        <div className="gradient-border p-5 fade-in-4" style={{ background: "#151D2D", borderRadius: 16 }}>
          <div className="text-sm font-semibold text-white mb-4">AI Recommendations</div>
          <div className="space-y-2">
            {score.reasons.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-300"
                style={{ background: "rgba(91,140,255,0.05)", border: "1px solid rgba(91,140,255,0.1)" }}>
                <span style={{ color: "#5B8CFF" }}>→</span> {r}
              </div>
            ))}
          </div>
        </div>
      )}

      {subs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500">No data yet. <a href="/settings" className="text-blue-400 hover:underline">Seed demo data →</a></p>
        </div>
      )}
    </div>
  );
}
