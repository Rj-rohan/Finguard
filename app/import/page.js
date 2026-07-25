"use client";
import { useState } from "react";
import { Upload, FileText, MessageSquare, Mail, Smartphone, CheckCircle } from "lucide-react";

const SAMPLE_CSV = `merchant,amount,date,category
Netflix,15.99,2024-12-01,Entertainment
Spotify,9.99,2024-12-05,Entertainment
Adobe Creative Cloud,54.99,2024-12-10,Productivity
AWS,23.50,2024-12-15,Cloud
Canva Pro,12.99,2024-12-20,Productivity`;

export default function ImportData() {
  const [tab, setTab] = useState("csv");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",");
    return lines.slice(1).map((line) => {
      const vals = line.split(",");
      return headers.reduce((obj, h, i) => ({ ...obj, [h.trim()]: vals[i]?.trim() }), {});
    });
  };

  const handleFile = (f) => {
    if (!f) return;
    setFile(f); setStatus("");
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(parseCSV(ev.target.result).slice(0, 5));
    reader.readAsText(f);
  };

  const importData = async () => {
    if (!file) return;
    setLoading(true); setStatus("Importing...");
    const text = await file.text();
    const rows = parseCSV(text).filter((r) => r.merchant && r.amount && r.date);
    const data = rows.map((r) => ({ merchant: r.merchant, amount: parseFloat(r.amount), date: r.date, category: r.category || "Other" }));
    const res = await fetch("/api/transactions", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
    const json = await res.json();
    setStatus(`✓ Imported ${json.count ?? rows.length} transactions successfully`);
    setPreview([]); setFile(null); setLoading(false);
  };

  const tabs = [
    { id: "csv", label: "CSV / Bank Statement", icon: FileText },
    { id: "sms", label: "SMS", icon: Smartphone },
    { id: "email", label: "Email / Gmail", icon: Mail },
    { id: "upi", label: "UPI History", icon: MessageSquare },
  ];

  return (
    <div className="space-y-5 fade-in max-w-3xl">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === id ? "text-white" : "text-slate-500 hover:text-slate-300 border border-white/8 hover:border-white/15"}`}
            style={tab === id ? { background: "linear-gradient(135deg, #5B8CFF, #4B7BEF)" } : { background: "rgba(255,255,255,0.03)" }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "csv" && (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            className="rounded-2xl p-12 text-center transition-all"
            style={{
              background: dragging ? "rgba(91,140,255,0.08)" : "rgba(255,255,255,0.02)",
              border: `2px dashed ${dragging ? "rgba(91,140,255,0.5)" : "rgba(255,255,255,0.08)"}`,
            }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(91,140,255,0.1)", border: "1px solid rgba(91,140,255,0.2)" }}>
              <Upload size={24} style={{ color: "#5B8CFF" }} />
            </div>
            <p className="text-white font-medium mb-1">Drop your CSV file here</p>
            <p className="text-slate-500 text-sm mb-4">or click to browse your files</p>
            <input type="file" accept=".csv" onChange={(e) => handleFile(e.target.files[0])} className="hidden" id="csv-upload" />
            <label htmlFor="csv-upload" className="btn-primary px-5 py-2 rounded-xl text-sm font-medium cursor-pointer inline-block">
              Choose File
            </label>
            {file && (
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-green-400">
                <CheckCircle size={15} /> {file.name}
              </div>
            )}
          </div>

          {/* Format reference */}
          <div className="gradient-border p-4" style={{ background: "#151D2D", borderRadius: 16 }}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Expected CSV Format</div>
            <pre className="text-xs text-slate-500 font-mono leading-relaxed">{SAMPLE_CSV}</pre>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="gradient-border overflow-hidden fade-in" style={{ background: "#151D2D", borderRadius: 16 }}>
              <div className="px-4 py-3 border-b border-white/5 text-sm font-medium text-white">Preview (first 5 rows)</div>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {Object.keys(preview[0]).map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="table-row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      {Object.values(row).map((v, j) => <td key={j} className="px-4 py-2.5 text-sm text-slate-300">{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center gap-3">
            {file && (
              <button onClick={importData} disabled={loading}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
                {loading ? "Importing..." : <><Upload size={14} /> Import Transactions</>}
              </button>
            )}
            {status && (
              <div className={`flex items-center gap-2 text-sm ${status.startsWith("✓") ? "text-green-400" : "text-slate-400"}`}>
                {status.startsWith("✓") && <CheckCircle size={15} />}
                {status}
              </div>
            )}
          </div>
        </div>
      )}

      {tab !== "csv" && (
        <div className="gradient-border p-12 text-center fade-in" style={{ background: "#151D2D", borderRadius: 16 }}>
          <div className="text-4xl mb-4">🔜</div>
          <div className="text-base font-semibold text-white mb-2">Coming Soon</div>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            {tab === "sms" && "SMS parsing integration — connect your phone to auto-detect payment SMS"}
            {tab === "email" && "Gmail OAuth integration — scan your inbox for subscription receipts"}
            {tab === "upi" && "UPI history import — upload your UPI transaction export file"}
          </p>
        </div>
      )}
    </div>
  );
}
