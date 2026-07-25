"use client";
import { useEffect, useState } from "react";
import { Trash2, Plus, Pencil, Check, X, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

const CATEGORIES = ["Entertainment", "Productivity", "Cloud", "Shopping", "Gaming", "Health", "Other"];
const STATUSES = ["active", "trial", "inactive"];
const EMPTY = { name: "", amount: "", frequency: "monthly", nextPayment: "", category: "Entertainment", status: "active" };

function RiskBadge({ sub }) {
  const unused = sub.lastUsed && new Date(sub.lastUsed) < new Date(Date.now() - 30 * 86400000);
  const score = unused ? (sub.amount > 20 ? "High" : "Medium") : "Low";
  const styles = { High: "badge-high", Medium: "badge-medium", Low: "badge-info" };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[score]}`}>{score}</span>;
}

function ServiceAvatar({ name }) {
  const colors = ["#5B8CFF", "#00D4FF", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
      style={{ background: `${color}22`, border: `1px solid ${color}44`, color }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/subscriptions").then((r) => r.json()).then((d) => { setSubs(d); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm("Delete this subscription?")) return;
    await fetch("/api/subscriptions", { method: "DELETE", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } });
    load();
  };

  const add = async (e) => {
    e.preventDefault();
    await fetch("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount), nextPayment: new Date(form.nextPayment) }),
      headers: { "Content-Type": "application/json" },
    });
    setForm(EMPTY); setAdding(false); load();
  };

  const saveEdit = async (id) => {
    await fetch("/api/subscriptions", {
      method: "PATCH",
      body: JSON.stringify({ id, ...editForm, amount: parseFloat(editForm.amount) }),
      headers: { "Content-Type": "application/json" },
    });
    setEditId(null); load();
  };

  const cycleStatus = async (s) => {
    const next = STATUSES[(STATUSES.indexOf(s.status) + 1) % STATUSES.length];
    await fetch("/api/subscriptions", { method: "PATCH", body: JSON.stringify({ id: s.id, status: next }), headers: { "Content-Type": "application/json" } });
    load();
  };

  const monthly = subs.filter((s) => s.status !== "inactive").reduce((sum, s) => sum + s.amount, 0);
  const unused = subs.filter((s) => s.lastUsed && new Date(s.lastUsed) < new Date(Date.now() - 30 * 86400000));

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">{subs.length}</span>
            <span className="text-slate-500 text-sm">subscriptions</span>
            <span className="text-slate-700">·</span>
            <span className="text-xl font-bold gradient-text">${monthly.toFixed(2)}</span>
            <span className="text-slate-500 text-sm">/month</span>
          </div>
          {unused.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-yellow-400">
              <AlertCircle size={12} />
              {unused.length} unused service{unused.length > 1 ? "s" : ""} detected
            </div>
          )}
        </div>
        <button onClick={() => setAdding(!adding)}
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium">
          <Plus size={15} /> Add Subscription
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <form onSubmit={add} className="gradient-border p-5 fade-in" style={{ background: "#151D2D", borderRadius: 16 }}>
          <div className="text-sm font-semibold text-white mb-4">New Subscription</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[["name", "Service Name", "text"], ["amount", "Amount ($)", "number"], ["nextPayment", "Next Payment", "date"]].map(([k, p, t]) => (
              <input key={k} type={t} placeholder={p} required value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="input-dark rounded-xl px-3 py-2.5 text-sm placeholder-slate-600" />
            ))}
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-dark rounded-xl px-3 py-2.5 text-sm">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input-dark rounded-xl px-3 py-2.5 text-sm">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-medium">Save</button>
              <button type="button" onClick={() => setAdding(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors">Cancel</button>
            </div>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="gradient-border overflow-hidden" style={{ background: "#151D2D", borderRadius: 16 }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["Service", "Amount", "Next Payment", "Category", "Status", "Risk", "AI Tip", ""].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="table-row-hover" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  {editId === s.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="input-dark rounded-lg px-2.5 py-1.5 text-sm w-full" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                          className="input-dark rounded-lg px-2.5 py-1.5 text-sm w-24" />
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">{new Date(s.nextPayment).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="input-dark rounded-lg px-2.5 py-1.5 text-sm">
                          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="input-dark rounded-lg px-2.5 py-1.5 text-sm">
                          {STATUSES.map((st) => <option key={st}>{st}</option>)}
                        </select>
                      </td>
                      <td colSpan={2} />
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(s.id)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"><Check size={13} /></button>
                          <button onClick={() => setEditId(null)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 text-slate-400 hover:bg-white/10 transition-colors"><X size={13} /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ServiceAvatar name={s.name} />
                          <div>
                            <div className="text-sm font-medium text-white">{s.name}</div>
                            <div className="text-[10px] text-slate-600 capitalize">{s.frequency}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-white">${s.amount}</div>
                        <div className="text-[10px] text-slate-600">/month</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">{new Date(s.nextPayment).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-400 px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>{s.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => cycleStatus(s)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize transition-all hover:opacity-80 badge-${s.status}`}>
                          {s.status}
                        </button>
                      </td>
                      <td className="px-4 py-3"><RiskBadge sub={s} /></td>
                      <td className="px-4 py-3">
                        {s.lastUsed && new Date(s.lastUsed) < new Date(Date.now() - 30 * 86400000) ? (
                          <span className="text-[10px] text-yellow-400 flex items-center gap-1"><TrendingUp size={10} /> Consider cancelling</span>
                        ) : (
                          <span className="text-[10px] text-green-400 flex items-center gap-1"><CheckCircle size={10} /> Looks good</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => { setEditId(s.id); setEditForm({ name: s.name, amount: s.amount, status: s.status, category: s.category }); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => del(s.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && subs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-slate-500 mb-3">No subscriptions yet</p>
            <a href="/settings" className="text-blue-400 text-sm hover:underline">Seed demo data →</a>
          </div>
        )}
      </div>
    </div>
  );
}
