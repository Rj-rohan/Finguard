"use client";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, Command, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/import": "Import Data",
  "/subscriptions": "Subscription Detector",
  "/price-hike": "Price Hike Monitor",
  "/duplicates": "Duplicate Finder",
  "/trials": "Free Trial Tracker",
  "/leak-score": "Leak Score",
  "/savings": "Savings Simulator",
  "/advisor": "AI Financial Advisor",
  "/analytics": "Spending Analytics",
  "/upcoming": "Upcoming Payments",
  "/alerts": "Smart Alerts",
  "/reports": "AI Reports",
  "/settings": "Settings",
};

export default function TopNav() {
  const path = usePathname();
  const router = useRouter();
  const title = PAGE_TITLES[path] || "FinGuard AI";
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

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
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 shrink-0"
      style={{ background: "rgba(11,18,32,0.8)", backdropFilter: "blur(20px)" }}>
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <span>FinGuard AI</span>
          <span>/</span>
          <span className="text-slate-500">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition-colors border border-white/5 hover:border-white/10"
          style={{ background: "rgba(255,255,255,0.03)" }}>
          <Search size={13} />
          <span>Search</span>
          <div className="flex items-center gap-0.5 ml-2 opacity-50">
            <Command size={10} /><span>K</span>
          </div>
        </button>

        <Link href="/alerts" className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-all border border-white/5">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#0B1220]" />
        </Link>

        {/* User menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-white/5 transition-all">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)" }}>
              {initials}
            </div>
            {user && <span className="text-sm text-slate-300 hidden md:block">{user.name.split(" ")[0]}</span>}
          </button>

          {showMenu && (
            <div className="absolute right-0 top-12 w-52 rounded-2xl overflow-hidden z-50 fade-in"
              style={{ background: "#1A2438", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}>
              {user && (
                <div className="px-4 py-3 border-b border-white/5">
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                  <div className="text-xs text-slate-500 truncate">{user.email}</div>
                </div>
              )}
              <Link href="/settings" onClick={() => setShowMenu(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                Settings
              </Link>
              <button onClick={logout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-colors">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />}
    </header>
  );
}
