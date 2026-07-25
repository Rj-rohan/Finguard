import "../globals.css";

export const metadata = { title: "FinGuard AI — Sign In" };

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "radial-gradient(ellipse at 30% 20%, rgba(91,140,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0,212,255,0.06) 0%, transparent 50%), #0B1220",
        fontFamily: "Inter, sans-serif",
      }}>
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(91,140,255,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)", filter: "blur(40px)" }} />
      {children}
    </div>
  );
}
