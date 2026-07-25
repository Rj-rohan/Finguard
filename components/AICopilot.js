"use client";
import { useEffect, useState, useRef } from "react";
import { Bot, Send, Sparkles, X, ChevronRight, TrendingDown, AlertTriangle, Zap } from "lucide-react";

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-white'>$1</strong>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

const SUGGESTED = [
  "Where am I wasting money?",
  "Which subscriptions should I cancel?",
  "How can I save $500 this year?",
];

export default function AICopilot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((r) => r.json())
      .then((subs) => {
        const now = Date.now();
        const unused = subs.filter((s) => s.lastUsed && new Date(s.lastUsed) < new Date(now - 30 * 86400000));
        const monthly = subs.reduce((s, x) => s + x.amount, 0);
        const trials = subs.filter((s) => s.status === "trial");
        const tips = [];
        if (unused.length) tips.push({ icon: TrendingDown, color: "text-red-400", bg: "bg-red-400/10", text: `Cancel ${unused[0].name} — save $${unused[0].amount}/mo` });
        if (trials.length) tips.push({ icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-400/10", text: `${trials[0].name} trial ends soon — $${trials[0].amount} charge incoming` });
        if (monthly > 0) tips.push({ icon: Zap, color: "text-blue-400", bg: "bg-blue-400/10", text: `You spend $${monthly.toFixed(0)}/mo on subscriptions` });
        setInsights(tips);
        setMessages([{
          role: "ai",
          text: `Hi Rohan! 👋 I've analyzed your subscriptions.\n\n${unused.length ? `You have **${unused.length} unused service${unused.length > 1 ? "s" : ""}** costing **$${unused.reduce((s, x) => s + x.amount, 0).toFixed(2)}/month**. ` : ""}${trials.length ? `**${trials.length} trial${trials.length > 1 ? "s" : ""}** about to charge. ` : ""}Ask me anything!`,
        }]);
      })
      .catch(() => {
        setMessages([{ role: "ai", text: "Hi! I'm your AI Copilot." }]);
      });
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (msg) => {
    const text = msg || input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((p) => [...p, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        body: JSON.stringify({ message: text }),
        headers: { "Content-Type": "application/json" },
      });
      const { reply } = await res.json();
      setMessages((p) => [...p, { role: "ai", text: reply }]);
    } catch {
      setMessages((p) => [...p, { role: "ai", text: "Sorry, couldn't process that. Try again." }]);
    }
    setLoading(false);
  };

  if (collapsed) {
    return (
      <button onClick={() => setCollapsed(false)}
        className="fixed right-4 bottom-6 w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl z-50 transition-all hover:scale-110"
        style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)", boxShadow: "0 8px 32px rgba(91,140,255,0.4)" }}>
        <Bot size={20} className="text-white" />
      </button>
    );
  }

  return (
    <aside className="w-72 shrink-0 flex flex-col h-screen sticky top-0 border-l border-white/5"
      style={{ background: "linear-gradient(180deg, #0F1829 0%, #0B1220 100%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #5B8CFF22, #00D4FF22)", border: "1px solid rgba(91,140,255,0.3)" }}>
            <Sparkles size={14} style={{ color: "#5B8CFF" }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">AI Copilot</div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
              <span className="text-[10px] text-slate-500">Always watching</span>
            </div>
          </div>
        </div>
        <button onClick={() => setCollapsed(true)} className="text-slate-600 hover:text-slate-400 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="px-3 pt-3 space-y-2">
          <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-1">Live Insights</div>
          {insights.map((ins, i) => (
            <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl ${ins.bg} border border-white/5`}>
              <ins.icon size={13} className={`${ins.color} shrink-0`} />
              <span className="text-xs text-slate-300 leading-snug">{ins.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Suggested prompts */}
      <div className="px-3 pt-3">
        <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-1 mb-2">Ask me</div>
        <div className="space-y-1.5">
          {SUGGESTED.map((s) => (
            <button key={s} onClick={() => send(s)}
              className="w-full text-left text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/8 flex items-center gap-2 group">
              <span className="text-blue-500 group-hover:text-blue-400">→</span>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 space-y-3 min-h-0">
        <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-1 mb-2">Chat</div>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "ai" && (
              <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mr-2 mt-0.5"
                style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)" }}>
                <Bot size={10} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                m.role === "user"
                  ? "text-white rounded-tr-sm"
                  : "text-slate-300 rounded-tl-sm border border-white/5"
              }`}
              style={m.role === "user"
                ? { background: "linear-gradient(135deg, #5B8CFF, #4B7BEF)" }
                : { background: "rgba(255,255,255,0.04)" }}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(m.text) }}
            />
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)" }}>
              <Bot size={10} className="text-white" />
            </div>
            <div className="flex gap-1 px-3 py-2.5 rounded-2xl rounded-tl-sm border border-white/5" style={{ background: "rgba(255,255,255,0.04)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dot-1" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dot-2" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dot-3" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI anything..."
            className="flex-1 input-dark rounded-xl px-3 py-2 text-xs placeholder-slate-600 min-w-0"
          />
          <button type="submit" disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #5B8CFF, #00D4FF)" }}>
            <Send size={12} className="text-white" />
          </button>
        </form>
      </div>
    </aside>
  );
}
