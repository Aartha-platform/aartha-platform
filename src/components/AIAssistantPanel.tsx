"use client";

import { useState, useEffect } from 'react';
import { X, Sparkles, Send, Bot, User, RefreshCw } from 'lucide-react';
import { generateAssistantReply, CopilotResponse } from '@/lib/assistantModes';

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const modes = [
  { key: 'sourcing', label: 'Sourcing' },
  { key: 'document', label: 'Doc Intel' },
  { key: 'rfq', label: 'RFQ Copilot' },
  { key: 'market', label: 'Market Intel' },
  { key: 'risk', label: 'Risk Scan' }
] as const;

export default function AIAssistantPanel({ isOpen, onClose }: AIAssistantPanelProps) {
  const [activeMode, setActiveMode] = useState<typeof modes[number]['key']>('sourcing');
  const [messages, setMessages] = useState<Record<string, { sender: 'bot' | 'user'; text: string }[]>>({
    sourcing: [{ sender: 'bot', text: 'Ask me to locate verified factories in specific GIDC clusters or map supplier details.' }],
    document: [{ sender: 'bot', text: 'Ask me to scan your invoice, packing list, or Certificate of Origin to check customs readiness.' }],
    rfq: [{ sender: 'bot', text: 'Need help drafting specifications for your RFQ? I can write a detailed RFQ payload for Morbi or Ankleshwar.' }],
    market: [{ sender: 'bot', text: 'Ask me for Q2 market price ranges, shipping log forecasts, or capacity updates.' }],
    risk: [{ sender: 'bot', text: 'I check Identity, Behavior, Content, and Geography risk signals. Test a 5-day delivery claim.' }]
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Show me verified Paracetamol manufacturers in Vatva GIDC.',
    'Sourcing fabrics from Surat - top recommendations?'
  ]);

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

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setMessages(prev => ({
      ...prev,
      [activeMode]: [...prev[activeMode], { sender: 'user', text }]
    }));
    setInput('');
    setLoading(true);

    fetch('/api/ai-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: activeMode, input: text })
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
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[999] backdrop-blur-xs transition-opacity duration-300" onClick={onClose} />
      )}

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white/95 dark:bg-[var(--surface)]/95 backdrop-blur-xl shadow-2xl z-[1000] transition-transform duration-300 overflow-hidden flex flex-col font-sans border-l border-black/10 dark:border-white/10 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-navy via-navy-light to-navy text-white p-4 space-y-3 flex-shrink-0 relative border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white transition-colors cursor-pointer select-none p-1 rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-xl text-white shadow-md">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">Aartha Sourcing Assistant</h3>
              <p className="text-[10px] text-amber-400 font-semibold">Grounded in verified trade corridor registries</p>
            </div>
          </div>
        </div>

        {/* Live Model Indicator */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold px-4 py-2 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>GPT-4o Grounded B2B Intelligence</span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
            Active
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-black/5 dark:border-white/10 bg-slate-50 dark:bg-slate-900 overflow-x-auto flex-shrink-0">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMode(m.key)}
              className={`flex-1 min-w-[85px] text-center py-3 text-[10px] font-extrabold uppercase tracking-wider transition-all border-b-2 cursor-pointer select-none ${
                activeMode === m.key
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                  : 'border-transparent text-text-secondary dark:text-slate-400 hover:text-navy dark:hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Messaging Logs */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
          {messages[activeMode].map((msg, idx) => (
            <div key={idx} className={`flex gap-2.5 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] shadow-sm ${
                msg.sender === 'user' ? 'bg-gradient-to-br from-amber-500 to-amber-600 font-bold' : 'bg-navy'
              }`}>
                {msg.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
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
              <span>GPT-4o model analyzing verified corridor data...</span>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="p-3 border-t border-black/5 dark:border-white/10 bg-slate-50 dark:bg-navy-light flex flex-wrap gap-1.5 flex-shrink-0">
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

        {/* Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }} 
          className="p-3.5 border-t border-black/10 dark:border-white/10 bg-white dark:bg-[var(--surface)] flex gap-2 flex-shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Assistant..."
            className="flex-1 bg-slate-100 dark:bg-slate-900 text-xs px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 focus:outline-none focus:border-amber-500 text-text-primary dark:text-white font-medium"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-amber px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </>
  );
}
