"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  const tryDemo = async () => {
    setError("");
    setDemoLoading(true);
    try {
      const res = await fetch("/api/demo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Demo setup failed"); setDemoLoading(false); return; }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setDemoLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); setLoading(false); return; }
      router.push(from);
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
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-500 text-sm">Sign in to your FinGuard AI account</p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5 text-sm text-red-300 fade-in"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
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
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-dark w-full rounded-xl pl-10 pr-11 py-3 text-sm placeholder-slate-600"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={15} /></>}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/5 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold hover:text-white transition-colors" style={{ color: "#5B8CFF" }}>
            Create one free
          </Link>
        </div>
      </div>

      {/* Demo button */}
      <div className="mt-4">
        <button onClick={tryDemo} disabled={demoLoading}
          className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          style={{ background: "rgba(91,140,255,0.08)", border: "1px solid rgba(91,140,255,0.25)", color: "#5B8CFF" }}>
          {demoLoading ? <><Loader2 size={16} className="animate-spin" /> Setting up demo...</> : <>⚡ Try Demo Account</>}
        </button>
        <p className="text-xs text-slate-600 text-center mt-2">demo@finguard.ai · Demo@1234</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md"><div className="skeleton h-96 rounded-2xl" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
