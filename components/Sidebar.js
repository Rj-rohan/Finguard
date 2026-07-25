"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Upload, CreditCard, TrendingUp, Copy,
  Gift, Gauge, PiggyBank, Bot, BarChart2, CalendarDays,
  Bell, FileText, Settings, ChevronLeft, ChevronRight, Shield, LogOut,
} from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Import Data", href: "/import", icon: Upload },
  { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { label: "Price Hike Monitor", href: "/price-hike", icon: TrendingUp },
  { label: "Duplicate Finder", href: "/duplicates", icon: Copy },
  { label: "Free Trial Tracker", href: "/trials", icon: Gift },
  { label: "Leak Score", href: "/leak-score", icon: Gauge },
  { label: "Savings Simulator", href: "/savings", icon: PiggyBank },
  { label: "AI Advisor", href: "/advisor", icon: Bot },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Upcoming Payments", href: "/upcoming", icon: CalendarDays },
  { label: "Smart Alerts", href: "/alerts", icon: Bell },
  { label: "AI Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => { if (d.user) setUser(d.user); }).catch(() => {});
  }, [path]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <aside
      className={`sidebar-transition shrink-0 flex flex-col h-screen sticky top-0 glass-strong border-r border-white/5 z-40 ${collapsed ? "w-16" : "w-60"}`}
      style={{ background: "linear-gradient(180deg, #0F1829 0%, #0B1220 100%)" }}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-white/5 h-16 px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)" }}>
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-none">FinGuard</div>
              <div className="text-[10px] font-medium leading-none mt-0.5" style={{ color: "#5B8CFF" }}>AI</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)" }}>
            <Shield size={16} className="text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all"
          style={collapsed ? { position: "absolute", right: -12, top: 20, background: "#151D2D", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "50%" } : {}}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                active ? "nav-active text-blue-400" : "text-slate-400 hover:text-white hover:bg-white/5"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon size={16} className={`shrink-0 ${active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}`} />
              {!collapsed && <span>{label}</span>}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 pulse-dot" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      {!collapsed && (
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)" }}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-white truncate">{user?.name?.split(" ")[0] || "Loading..."}</div>
              <div className="text-xs text-slate-500 truncate">{user?.email || ""}</div>
            </div>
            <button onClick={logout} title="Sign out"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
