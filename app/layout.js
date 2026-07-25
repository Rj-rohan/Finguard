import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import AICopilot from "@/components/AICopilot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata = { title: "FinGuard AI", description: "AI-Powered Subscription & Financial Leak Detector" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex h-screen overflow-hidden" style={{ background: "#0B1220", fontFamily: "Inter, sans-serif" }}>
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-y-auto p-6" style={{ background: "radial-gradient(ellipse at 20% 0%, rgba(91,140,255,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(0,212,255,0.03) 0%, transparent 60%), #0B1220" }}>
            {children}
          </main>
        </div>
        <AICopilot />
      </body>
    </html>
  );
}
