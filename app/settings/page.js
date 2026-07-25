"use client";
import { useState, useEffect } from "react";
import { Check, Loader2, Shield, Bell, Database, Palette } from "lucide-react";
import { useRouter } from "next/navigation";

const DEFAULTS = { currency: "USD", emailAlerts: true, priceHikeAlert: true, trialAlert: true, unusedAlert: true, duplicateAlert: true };

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle}
      className="w-11 h-6 rounded-full transition-all relative shrink-0"
      style={{ background: on ? "linear-gradient(135deg, #5B8CFF, #00D4FF)" : "rgba(255,255,255,0.08)" }}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="gradient-border p-5 fade-in" style={{ background: "#151D2D", borderRadius: 16 }}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(91,140,255,0.1)", border: "1px solid rgba(91,140,255,0.2)" }}>
          <Icon size={14} style={{ color: "#5B8CFF" }} />
        </div>
        <div className="text-sm font-semibold text-white">{title}</div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("finguard-settings");
      if (stored) setSettings({ ...DEFAULTS, ...JSON.parse(stored) });
    } catch {}
  }, []);

  const save = () => {
    localStorage.setItem("finguard-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  const seed = async () => {
    setSeeding(true);
    await fetch("/api/seed", { method: "POST" });
    setSeeding(false);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="space-y-5 max-w-2xl fade-in">
      <Section icon={Palette} title="Preferences">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-2">Currency</label>
            <select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="input-dark w-full rounded-xl px-3 py-2.5 text-sm">
              {["USD", "EUR", "GBP", "INR", "CAD", "AUD"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-2">Plan</label>
            <div className="input-dark rounded-xl px-3 py-2.5 text-sm flex items-center justify-between">
              <span className="text-white">Pro</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full badge-active">Active</span>
            </div>
          </div>
        </div>
      </Section>

      <Section icon={Bell} title="Notification Preferences">
        <div className="space-y-4">
          {[
            { key: "emailAlerts", label: "Email Alerts", desc: "Receive alerts via email" },
            { key: "priceHikeAlert", label: "Price Hike Alerts", desc: "Notify when subscription prices increase" },
            { key: "trialAlert", label: "Trial Ending Alerts", desc: "Notify 3 days before trial ends" },
            { key: "unusedAlert", label: "Unused Subscription Alerts", desc: "Notify for subscriptions unused 30+ days" },
            { key: "duplicateAlert", label: "Duplicate Service Alerts", desc: "Notify when duplicate services detected" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div>
                <div className="text-sm font-medium text-white">{label}</div>
                <div className="text-xs text-slate-600 mt-0.5">{desc}</div>
              </div>
              <Toggle on={settings[key]} onToggle={() => toggle(key)} />
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Database} title="Data Management">
        <p className="text-sm text-slate-400 mb-4">Seed the database with realistic demo data to explore all features. This replaces existing data.</p>
        <div className="flex gap-3">
          <button onClick={seed} disabled={seeding}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
            {seeding ? <><Loader2 size={14} className="animate-spin" /> Seeding...</> : "🌱 Seed Demo Data"}
          </button>
        </div>
      </Section>

      <button onClick={save}
        className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium">
        {saved ? <><Check size={15} /> Saved!</> : <><Shield size={15} /> Save Settings</>}
      </button>
    </div>
  );
}
