import Link from "next/link";
import { Shield, Zap, TrendingDown, Bot, BarChart2, Bell, ArrowRight, Check, Star } from "lucide-react";

const features = [
  { icon: TrendingDown, title: "Leak Detection", desc: "AI finds hidden subscriptions draining your money every month", color: "#EF4444" },
  { icon: Bot, title: "AI Financial Advisor", desc: "Chat with AI to get personalized savings recommendations", color: "#5B8CFF" },
  { icon: BarChart2, title: "Spending Analytics", desc: "Beautiful charts showing exactly where your money goes", color: "#00D4FF" },
  { icon: Bell, title: "Smart Alerts", desc: "Get notified before trials end or prices increase", color: "#F59E0B" },
  { icon: Zap, title: "Savings Simulator", desc: "See how much you'd have if you invested your savings", color: "#22C55E" },
  { icon: Shield, title: "Price Hike Monitor", desc: "Track every price increase across all your subscriptions", color: "#8B5CF6" },
];

const stats = [
  { value: "$96", label: "avg monthly waste detected" },
  { value: "3.2x", label: "ROI in first month" },
  { value: "14min", label: "avg setup time" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "#0B1220", fontFamily: "Inter, sans-serif" }}>
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(91,140,255,0.15) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 h-16 border-b border-white/5"
        style={{ background: "rgba(11,18,32,0.8)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)" }}>
            <Shield size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white">FinGuard <span style={{ color: "#5B8CFF" }}>AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/signup"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #5B8CFF, #4B7BEF)", boxShadow: "0 4px 15px rgba(91,140,255,0.3)" }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: "rgba(91,140,255,0.1)", border: "1px solid rgba(91,140,255,0.2)", color: "#5B8CFF" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 pulse-dot" />
          AI-Powered Subscription Intelligence
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 max-w-4xl">
          Stop Leaking{" "}
          <span style={{
            background: "linear-gradient(135deg, #5B8CFF 0%, #00D4FF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Money
          </span>
          <br />on Subscriptions
        </h1>

        <p className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
          FinGuard AI detects unused subscriptions, price hikes, and duplicate services — then tells you exactly how to save money.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <Link href="/signup"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-semibold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)", boxShadow: "0 8px 32px rgba(91,140,255,0.4)" }}>
            Start for Free <ArrowRight size={18} />
          </Link>
          <Link href="/login"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-medium text-slate-300 hover:text-white transition-all border border-white/10 hover:border-white/20"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            Sign In to Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black text-white mb-0.5"
                style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {value}
              </div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Dashboard preview card */}
        <div className="w-full max-w-3xl rounded-3xl overflow-hidden border border-white/8 shadow-2xl"
          style={{ background: "#151D2D", boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(91,140,255,0.1)" }}>
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 rounded-lg text-xs text-slate-500 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                app.finguard.ai/dashboard
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-3 gap-3">
            {[
              { label: "Monthly Spend", value: "$127.43", color: "#5B8CFF" },
              { label: "Leak Score", value: "42/100", color: "#EF4444" },
              { label: "Potential Savings", value: "$54/mo", color: "#22C55E" },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-xs text-slate-500 mb-2">{label}</div>
                <div className="text-2xl font-bold" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>
          <div className="px-6 pb-6 grid grid-cols-2 gap-3">
            {[
              { name: "Netflix", amount: "$15.99", status: "active", tip: "Price hiked +33%" },
              { name: "Adobe CC", amount: "$54.99", status: "unused", tip: "Unused 45 days" },
              { name: "Spotify", amount: "$9.99", status: "active", tip: "Looks good" },
              { name: "Canva Pro", amount: "$12.99", status: "unused", tip: "Consider cancelling" },
            ].map(({ name, amount, status, tip }) => (
              <div key={name} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: "rgba(91,140,255,0.15)", color: "#5B8CFF" }}>{name[0]}</div>
                  <div>
                    <div className="text-xs font-medium text-white">{name}</div>
                    <div className="text-[10px] text-slate-600">{tip}</div>
                  </div>
                </div>
                <div className="text-xs font-semibold" style={{ color: status === "unused" ? "#EF4444" : "#22C55E" }}>{amount}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Everything you need to stop the leak</h2>
            <p className="text-slate-400">Powered by AI, built for people who hate wasting money</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
                style={{ background: "#151D2D" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="text-sm font-semibold text-white mb-1.5">{title}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-10 rounded-3xl border border-white/8"
            style={{ background: "linear-gradient(135deg, rgba(91,140,255,0.08), rgba(0,212,255,0.05))" }}>
            <h2 className="text-3xl font-bold text-white mb-3">Ready to stop the leak?</h2>
            <p className="text-slate-400 mb-8">Join thousands saving money with FinGuard AI. Free forever.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/signup"
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)", boxShadow: "0 8px 32px rgba(91,140,255,0.4)" }}>
                Create Free Account <ArrowRight size={18} />
              </Link>
              <Link href="/login"
                className="flex items-center justify-center px-8 py-3.5 rounded-2xl text-base font-medium text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-colors">
                Sign In
              </Link>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-slate-600">
              {["No credit card required", "Free forever", "Setup in 14 minutes"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <Check size={11} className="text-green-500" /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-6 text-center text-xs text-slate-600">
        © 2025 FinGuard AI · Built for Innovahack
      </footer>
    </div>
  );
}
