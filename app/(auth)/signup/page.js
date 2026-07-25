"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";

function PasswordStrength({ password }) {
  const checks = [
    { label: "At least 6 characters", ok: password.length >= 6 },
    { label: "Contains a number", ok: /\d/.test(password) },
    { label: "Contains uppercase", ok: /[A-Z]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["#EF4444", "#F59E0B", "#22C55E"];
  const labels = ["Weak", "Fair", "Strong"];

  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score - 1] : "rgba(255,255,255,0.08)" }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map(({ label, ok }) => (
            <div key={label} className={`flex items-center gap-1 text-[10px] transition-colors ${ok ? "text-green-400" : "text-slate-600"}`}>
              <Check size={9} />
              {label}
            </div>
          ))}
        </div>
        {score > 0 && <span className="text-[10px] font-semibold" style={{ color: colors[score - 1] }}>{labels[score - 1]}</span>}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md fade-in">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)", boxShadow: "0 8px 32px rgba(91,140,255,0.4)" }}>
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <div className="text-xl font-bold text-white leading-none">FinGuard</div>
          <div className="text-xs font-semibold leading-none mt-0.5" style={{ color: "#5B8CFF" }}>AI</div>
        </div>
      </div>

      {/* Card */}
      <div className="gradient-border p-8" style={{ background: "#151D2D", borderRadius: 20 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-slate-500 text-sm">Start detecting subscription leaks for free</p>
        </div>

        {/* Feature pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {["AI-powered insights", "Leak detection", "Free forever"].map((f) => (
            <span key={f} className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full"
              style={{ background: "rgba(91,140,255,0.1)", border: "1px solid rgba(91,140,255,0.2)", color: "#5B8CFF" }}>
              <Check size={9} /> {f}
            </span>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5 text-sm text-red-300 fade-in"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Full name</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="text"
                required
                placeholder="Rohan Sharma"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-dark w-full rounded-xl pl-10 pr-4 py-3 text-sm placeholder-slate-600"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Email address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-dark w-full rounded-xl pl-10 pr-4 py-3 text-sm placeholder-slate-600"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type={showPass ? "text" : "password"}
                required
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-dark w-full rounded-xl pl-10 pr-11 py-3 text-sm placeholder-slate-600"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <PasswordStrength password={form.password} />
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : <>Create Account <ArrowRight size={15} /></>}
          </button>
        </form>

        <p className="text-[10px] text-slate-600 text-center mt-4">
          By signing up you agree to our Terms of Service and Privacy Policy
        </p>

        <div className="mt-5 pt-5 border-t border-white/5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold hover:text-white transition-colors" style={{ color: "#5B8CFF" }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
