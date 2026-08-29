"use client";

import { useState, useEffect } from 'react';
import { Send, RefreshCw, Bot, User, Sparkles, RotateCcw } from 'lucide-react';
import { generateAssistantReply } from '@/lib/assistantModes';

const modes = [
  { key: 'sourcing', label: 'Sourcing Copilot', desc: 'Find verified factories' },
  { key: 'document', label: 'Document Intel', desc: 'Customs & L/C check' },
  { key: 'rfq', label: 'RFQ Copilot', desc: 'Draft export specs' },
  { key: 'market', label: 'Market Intel', desc: 'GIDC price benchmarks' },
  { key: 'risk', label: 'Risk Scan', desc: 'Verify supplier claims' }
] as const;

const initialGreetings: Record<string, string> = {
  sourcing: 'Hi! I am the Sourcing Copilot. How can I help you find verified factories, analyze GIDC capacity logs, or georoute suppliers today?',
  document: 'Hi! I am the Document Copilot. Send me invoice descriptions or draft parameters to verify German customs compliance.',
  rfq: 'Hi! I am the RFQ Drafting Copilot. Tell me what product or GIDC cluster you are sourcing from, and I will draft a structured enquiry.',
  market: 'Hi! I am the Market Intel Copilot. I track commodity rates (e.g. Jamnagar brass fittings, chemical raw materials) in Gujarat.',
  risk: 'Hi! I am the Risk Detection Copilot. Post any unusual claims (e.g. 5-day dispatch for Paracetamol API) to verify safety.'
};

export default function AIAssistantPage() {
  const [activeMode, setActiveMode] = useState<typeof modes[number]['key']>('sourcing');
  const [messages, setMessages] = useState<Record<string, { sender: 'bot' | 'user'; text: string }[]>>({
    sourcing: [{ sender: 'bot', text: initialGreetings.sourcing }],
    document: [{ sender: 'bot', text: initialGreetings.document }],
    rfq: [{ sender: 'bot', text: initialGreetings.rfq }],
    market: [{ sender: 'bot', text: initialGreetings.market }],
    risk: [{ sender: 'bot', text: initialGreetings.risk }]
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (activeMode === 'sourcing') {
      setSuggestions(['Show me verified Paracetamol manufacturers in Vatva GIDC.', 'Show Surat Textile GOTS compliance status.']);
    } else if (activeMode === 'document') {
      setSuggestions(['Scan commercial invoice INV-2026-098.', 'Check Certificate of Origin draft specifications.']);
    } else if (activeMode === 'rfq') {
      setSuggestions(['Draft an RFQ for GOTS cotton fabrics.', 'Draft a Paracetamol API bulk supply RFQ.']);
    } else if (activeMode === 'market') {
      setSuggestions(['Show Specialty Chemical price forecasts.', 'Are raw material shipping rates to Germany increasing?']);
    } else if (activeMode === 'risk') {
      setSuggestions(['Evaluate risk of 5-day chemical delivery offer.', 'How does GIDC geocoding screening prevent fraud?']);
    }
  }, [activeMode]);

  const handleClearChat = () => {
    setMessages(prev => ({
      ...prev,
      [activeMode]: [{ sender: 'bot', text: initialGreetings[activeMode] }]
    }));
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const currentHistory = messages[activeMode];
    const updatedMessages = [...currentHistory, { sender: 'user' as const, text }];

    setMessages(prev => ({
      ...prev,
      [activeMode]: updatedMessages
    }));
    setInput('');
    setLoading(true);

    fetch('/api/ai-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        mode: activeMode, 
        input: text,
        history: currentHistory 
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('API failed');
        return res.json();
      })
      .then(resp => {
        setMessages(prev => ({
          ...prev,
          [activeMode]: [...prev[activeMode], { sender: 'bot', text: resp.reply }]
        }));
        if (resp.suggestedPrompts) setSuggestions(resp.suggestedPrompts);
        setLoading(false);
      })
      .catch(() => {
        const resp = generateAssistantReply(activeMode, text);
        setMessages(prev => ({
          ...prev,
          [activeMode]: [...prev[activeMode], { sender: 'bot', text: resp.reply }]
        }));
        if (resp.suggestedPrompts) setSuggestions(resp.suggestedPrompts);
        setLoading(false);
      });
  };

  return (
    <div className="bg-transparent font-sans min-h-screen text-text-primary py-8 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 h-[650px]">
        
        {/* Left Column: Mode selection description */}
        <div className="bg-white dark:bg-[var(--surface)] border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-text-primary dark:text-white">Assistant Modes</h3>
              <p className="text-[10px] text-text-muted dark:text-slate-400">Grounded, expert trade help</p>
            </div>
            
            <div className="space-y-2">
              {modes.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setActiveMode(m.key)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                    activeMode === m.key
                      ? 'border-amber-500 bg-amber-500/10 font-bold'
                      : 'border-black/10 dark:border-white/10 bg-transparent hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs text-text-primary dark:text-white leading-tight font-extrabold">{m.label}</div>
                    <div className="text-[9px] text-text-muted dark:text-slate-400 truncate">{m.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-navy to-navy-dark text-white rounded-xl p-3.5 space-y-2 border border-white/10">
            <h5 className="font-extrabold text-[10px] text-amber-400 uppercase tracking-wider">Precision Moat</h5>
            <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">
              Aartha AI reads geocoded coordinates, DGFT licenses, and trade databases in real-time.
            </p>
          </div>
        </div>

        {/* Right Column: Chat workspace */}
        <div className="bg-white dark:bg-[var(--surface)] border border-black/10 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
          {/* Active Mode header */}
          <div className="bg-gradient-to-r from-navy via-navy-light to-navy text-white p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="bg-amber-500 p-2 rounded-xl text-white shadow-md">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="font-extrabold text-xs uppercase tracking-wider text-white">
                  {modes.find(m => m.key === activeMode)?.label}
                </div>
                <div className="text-[10px] text-amber-400 font-semibold">Grounded export corridor AI assistant</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                title="Reset conversation"
                className="text-slate-300 hover:text-white transition-colors cursor-pointer select-none p-1.5 rounded-lg hover:bg-white/10 flex items-center gap-1 text-[11px]"
              >
                <RotateCcw size={13} />
                <span className="text-[10px]">Reset</span>
              </button>
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2.5 py-1 rounded-full font-extrabold uppercase border border-emerald-500/30">
                Active Engine
              </span>
            </div>
          </div>

          {/* AI Live Engine Status Strip */}
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] sm:text-[11px] font-extrabold px-4 py-2 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Verified Corridor Intelligence Active</span>
            </div>
            <span className="text-[9px] font-mono uppercase bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
              Real-time AI
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
            {messages[activeMode].map((msg, idx) => (
              <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs ${
                  msg.sender === 'user' ? 'bg-amber-500 font-bold' : 'bg-navy'
                }`}>
                  {msg.sender === 'user' ? <User size={13} /> : <Bot size={13} />}
                </div>
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed border shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-white border-amber-500 rounded-tr-none'
                    : 'bg-white dark:bg-[var(--surface)] text-text-primary dark:text-slate-200 border-black/10 dark:border-white/10 rounded-tl-none'
                }`}>
                  {msg.text.startsWith('###') || msg.text.includes('- **') ? (
                    <div className="space-y-2 whitespace-pre-wrap">
                      {msg.text.split('\n').map((line, lIdx) => {
                        if (line.startsWith('### ')) {
                          return <h4 key={lIdx} className="font-extrabold text-xs uppercase tracking-wide text-amber-600 dark:text-amber-400 mt-1 first:mt-0">{line.replace('### ', '')}</h4>;
                        }
                        if (line.startsWith('- **')) {
                          const parts = line.substring(2).split('**');
                          return (
                            <div key={lIdx} className="pl-2.5 relative before:absolute before:left-0 before:top-[6px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-amber-500">
                              <strong className="text-text-primary dark:text-white font-extrabold">{parts[0]}</strong>{parts.slice(1).join('')}
                            </div>
                          );
                        }
                        return <p key={lIdx}>{line}</p>;
                      })}
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-bold">
                <RefreshCw size={14} className="animate-spin" />
                <span>Analyzing verified corridor parameters...</span>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3 border-t border-black/5 dark:border-white/10 bg-slate-50 dark:bg-navy-light flex flex-wrap gap-2">
              <span className="text-[9px] font-extrabold text-text-muted dark:text-slate-400 uppercase tracking-wider self-center">Suggested:</span>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="bg-white dark:bg-[var(--surface)] text-text-secondary dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-black/10 dark:border-white/10 hover:border-amber-500/40 transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }} 
            className="p-3.5 border-t border-black/10 dark:border-white/10 bg-white dark:bg-[var(--surface)] flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Gujarat GIDC suppliers, docs, or market rates..."
              className="flex-1 bg-slate-100 dark:bg-slate-900 text-xs px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 focus:outline-none focus:border-amber-500 text-text-primary dark:text-white font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-amber px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
            >
              <Send size={14} />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
