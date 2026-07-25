"use client";
import { useEffect, useState, useRef } from "react";
import { Bot, Send, Mail, Sparkles, Copy, Check } from "lucide-react";

const EMAILS = {
  cancel: (name, amount) => `Subject: Request to Cancel My ${name} Subscription\n\nDear ${name} Support Team,\n\nI am writing to request the cancellation of my ${name} subscription (currently $${amount}/month), effective immediately.\n\nPlease confirm the cancellation and ensure no further charges are applied to my payment method.\n\nThank you for your assistance.\n\nBest regards,\n[Your Name]`,
  downgrade: (name, amount) => `Subject: Request to Downgrade My ${name} Plan\n\nDear ${name} Team,\n\nI would like to downgrade my current ${name} plan ($${amount}/month) to a more affordable tier.\n\nCould you please advise on available lower-cost options and process the downgrade?\n\nThank you,\n[Your Name]`,
  negotiate: (name, amount) => `Subject: Loyalty Discount Request — ${name}\n\nDear ${name} Team,\n\nI have been a loyal ${name} customer and I'm considering cancelling due to the current price of $${amount}/month.\n\nI would appreciate if you could offer a loyalty discount or promotional rate.\n\nLooking forward to your response.\n\nBest regards,\n[Your Name]`,
};

const SUGGESTED = [
  "Where am I wasting money?",
  "Which subscriptions should I cancel?",
  "How can I save $500 this year?",
  "What's my most expensive subscription?",
];

function parseMarkdown(text) {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong class='text-white'>$1</strong>").replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>");
}

export default function Advisor() {
  const [subs, setSubs] = useState([]);
  const [messages, setMessages] = useState([{
    role: "ai",
    text: "Hi! I'm your AI Financial Advisor. I can analyze your subscriptions, identify waste, and generate negotiation emails. What would you like to know?",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSub, setSelectedSub] = useState("");
  const [emailType, setEmailType] = useState("cancel");
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { fetch("/api/subscriptions").then((r) => r.json()).then(setSubs); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (msg) => {
    const text = msg || input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((p) => [...p, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/advisor", { method: "POST", body: JSON.stringify({ message: text }), headers: { "Content-Type": "application/json" } });
      const { reply } = await res.json();
      setMessages((p) => [...p, { role: "ai", text: reply }]);
    } catch {
      setMessages((p) => [...p, { role: "ai", text: "Sorry, I couldn't process that. Please try again." }]);
    }
    setLoading(false);
  };

  const sub = subs.find((s) => s.name === selectedSub);
  const emailContent = sub ? EMAILS[emailType](sub.name, sub.amount) : "";

  const copyEmail = () => { navigator.clipboard.writeText(emailContent); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 h-[calc(100vh-8rem)] fade-in">
      {/* Chat */}
      <div className="gradient-border flex flex-col overflow-hidden" style={{ background: "#151D2D", borderRadius: 16 }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)" }}>
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI Financial Advisor</div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
              Online · Powered by Gemini
            </div>
          </div>
        </div>

        {/* Suggested prompts */}
        <div className="px-4 pt-3 flex gap-2 flex-wrap">
          {SUGGESTED.map((s) => (
            <button key={s} onClick={() => send(s)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-white/8 hover:border-blue-400/30 hover:bg-blue-400/5 transition-all">
              {s}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "ai" && (
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)" }}>
                  <Bot size={12} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm border border-white/5"}`}
                style={m.role === "user"
                  ? { background: "linear-gradient(135deg, #5B8CFF, #4B7BEF)", color: "white" }
                  : { background: "rgba(255,255,255,0.04)", color: "#CBD5E1" }}
                dangerouslySetInnerHTML={{ __html: parseMarkdown(m.text) }}
              />
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)" }}>
                <Bot size={12} className="text-white" />
              </div>
              <div className="flex gap-1.5 items-center px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5" style={{ background: "rgba(255,255,255,0.04)" }}>
                <span className="w-2 h-2 rounded-full bg-blue-400 dot-1" />
                <span className="w-2 h-2 rounded-full bg-blue-400 dot-2" />
                <span className="w-2 h-2 rounded-full bg-blue-400 dot-3" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-4 border-t border-white/5 flex gap-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your subscriptions..."
            className="flex-1 input-dark rounded-xl px-4 py-2.5 text-sm placeholder-slate-600" />
          <button type="submit" disabled={loading || !input.trim()}
            className="btn-primary w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40">
            <Send size={15} />
          </button>
        </form>
      </div>

      {/* Email Generator */}
      <div className="gradient-border flex flex-col overflow-hidden" style={{ background: "#151D2D", borderRadius: 16 }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(91,140,255,0.1)", border: "1px solid rgba(91,140,255,0.2)" }}>
            <Mail size={16} style={{ color: "#5B8CFF" }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI Subscription Negotiator</div>
            <div className="text-[10px] text-slate-500">Generate cancellation & negotiation emails</div>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          <select value={selectedSub} onChange={(e) => setSelectedSub(e.target.value)}
            className="input-dark w-full rounded-xl px-4 py-2.5 text-sm">
            <option value="">Select a subscription...</option>
            {subs.map((s) => <option key={s.id} value={s.name}>{s.name} (${s.amount}/mo)</option>)}
          </select>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "cancel", label: "Cancel", color: "#EF4444" },
              { id: "downgrade", label: "Downgrade", color: "#F59E0B" },
              { id: "negotiate", label: "Negotiate", color: "#5B8CFF" },
            ].map(({ id, label, color }) => (
              <button key={id} onClick={() => setEmailType(id)}
                className="py-2.5 rounded-xl text-sm font-medium transition-all"
                style={emailType === id
                  ? { background: `${color}20`, border: `1px solid ${color}40`, color }
                  : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#64748B" }}>
                {label}
              </button>
            ))}
          </div>

          {selectedSub ? (
            <>
              <div className="flex-1 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-64"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <pre className="whitespace-pre-wrap">{emailContent}</pre>
              </div>
              <button onClick={copyEmail}
                className={`w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${copied ? "bg-green-500/20 text-green-400 border border-green-500/30" : "btn-primary"}`}>
                {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy to Clipboard</>}
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Sparkles size={32} className="text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">Select a subscription above to generate a professional email</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
