"use client";
import { useEffect, useState, useRef } from "react";
import { Bot, Send, Mail, Loader2 } from "lucide-react";

const EMAILS = {
  cancel: (name, amount) =>
    `Subject: Request to Cancel My ${name} Subscription\n\nDear ${name} Support Team,\n\nI am writing to request the cancellation of my ${name} subscription (currently $${amount}/month), effective immediately.\n\nPlease confirm the cancellation and ensure no further charges are applied to my payment method.\n\nThank you for your assistance.\n\nBest regards,\n[Your Name]`,
  downgrade: (name, amount) =>
    `Subject: Request to Downgrade My ${name} Plan\n\nDear ${name} Team,\n\nI would like to downgrade my current ${name} plan ($${amount}/month) to a more affordable tier.\n\nCould you please advise on available lower-cost options and process the downgrade?\n\nThank you,\n[Your Name]`,
  negotiate: (name, amount) =>
    `Subject: Loyalty Discount Request — ${name} Subscription\n\nDear ${name} Team,\n\nI have been a loyal ${name} customer and I'm considering cancelling due to the recent price increase to $${amount}/month.\n\nI would appreciate if you could offer a loyalty discount or promotional rate to help me continue my subscription.\n\nLooking forward to your response.\n\nBest regards,\n[Your Name]`,
};

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

export default function Advisor() {
  const [subs, setSubs] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm your AI Financial Advisor powered by Groq. Ask me anything about your subscriptions — I can find waste, suggest savings, or generate negotiation emails.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSub, setSelectedSub] = useState("");
  const [emailType, setEmailType] = useState("cancel");
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch("/api/subscriptions").then((r) => r.json()).then(setSubs);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        body: JSON.stringify({ message: userMsg }),
        headers: { "Content-Type": "application/json" },
      });
      const { reply } = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Failed to get a response. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const sub = subs.find((s) => s.name === selectedSub);
  const emailContent = sub ? EMAILS[emailType](sub.name, sub.amount) : "";

  const copyEmail = () => {
    navigator.clipboard.writeText(emailContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickPrompts = [
    "Where am I wasting money?",
    "Which subscriptions should I cancel?",
    "How much can I save this year?",
    "Do I have duplicate services?",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">AI Financial Advisor</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col h-[560px]">
          <div className="p-4 border-b border-gray-800 flex items-center gap-2">
            <Bot size={18} className="text-emerald-400" />
            <span className="font-semibold text-white">LeakZero AI</span>
            <span className="ml-auto text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Live</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user" ? "bg-emerald-500 text-white" : "bg-gray-800 text-gray-200"
                  }`}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(m.text) }}
                />
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-emerald-400" />
                  <span className="text-gray-400 text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-3 pb-2 flex gap-2 flex-wrap">
            {quickPrompts.map((q) => (
              <button key={q} onClick={() => setInput(q)}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 px-2 py-1 rounded-lg transition-colors">
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={send} className="p-3 border-t border-gray-800 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your spending..."
              disabled={loading}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 disabled:opacity-50"
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white p-2 rounded-lg transition-colors">
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Email Generator */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={18} className="text-blue-400" />
            <h2 className="font-semibold text-white">AI Subscription Negotiator</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Generate cancellation, downgrade, or negotiation emails instantly.
          </p>

          <div className="space-y-3">
            <select
              value={selectedSub}
              onChange={(e) => setSelectedSub(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="">Select a subscription...</option>
              {subs.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} (${s.amount}/mo)
                </option>
              ))}
            </select>

            <div className="grid grid-cols-3 gap-2">
              {["cancel", "downgrade", "negotiate"].map((t) => (
                <button key={t} onClick={() => setEmailType(t)}
                  className={`py-2 rounded-lg text-sm capitalize transition-colors ${
                    emailType === t ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}>
                  {t}
                </button>
              ))}
            </div>

            {selectedSub && (
              <>
                <div className="bg-gray-800 rounded-lg p-3 max-h-52 overflow-y-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">{emailContent}</pre>
                </div>
                <button onClick={copyEmail}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm transition-colors">
                  {copied ? "✓ Copied!" : "Copy Email to Clipboard"}
                </button>
                <button
                  onClick={async () => {
                    setLoading(true);
                    const res = await fetch("/api/ai-chat", {
                      method: "POST",
                      body: JSON.stringify({ message: `Write a professional ${emailType} email for ${selectedSub} subscription at $${sub?.amount}/month. Make it persuasive and polite.` }),
                      headers: { "Content-Type": "application/json" },
                    });
                    const { reply } = await res.json();
                    setMessages((prev) => [...prev, { role: "ai", text: reply }]);
                    setLoading(false);
                  }}
                  className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 py-2 rounded-lg text-sm transition-colors">
                  ✨ Generate AI-Powered Email
                </button>
              </>
            )}

            {!selectedSub && (
              <div className="text-center py-8 text-gray-600 text-sm">
                Select a subscription above to generate an email
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
