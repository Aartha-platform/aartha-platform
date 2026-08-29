"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Send, RefreshCw, Bot, User, Sparkles, RotateCcw,
  Building2, FileCheck2, FileEdit, TrendingUp, ShieldAlert,
  ExternalLink, CheckCircle2, Shield, ArrowRight, MapPin
} from 'lucide-react';
import { generateAssistantReply } from '@/lib/assistantModes';

const modes = [
  { key: 'sourcing', label: 'Sourcing Copilot', desc: 'Find verified Gujarat factories & GIDC clusters', icon: Building2 },
  { key: 'document', label: 'Document Intel', desc: 'Customs, invoice, CoO & L/C verification', icon: FileCheck2 },
  { key: 'rfq', label: 'RFQ Copilot', desc: 'Draft structured export-ready enquiries', icon: FileEdit },
  { key: 'market', label: 'Market Intel', desc: 'Real-time GIDC price benchmarks & trends', icon: TrendingUp },
  { key: 'risk', label: 'Risk Scan', desc: 'Audit trail, geocoding & fraud check', icon: ShieldAlert }
] as const;

const initialGreetings: Record<string, string> = {
  sourcing: '👋 **Welcome to Aartha Sourcing Intelligence!**\n\nAsk me to locate verified factories across Gujarat GIDC industrial clusters (Ankleshwar, Vatva, Morbi, Surat, Rajkot), compare trust scores, or inspect certifications.',
  document: '📑 **Document Intelligence Copilot Ready.**\n\nPaste invoice details, packing list specs, or Certificate of Origin drafts to verify customs readiness for USA, EU, Germany, and UAE ports.',
  rfq: '📝 **Smart RFQ Drafting Copilot Active.**\n\nTell me what product, volume, or GIDC cluster you need. I will structure a complete, machine-readable RFQ with exact technical parameters.',
  market: '📈 **Gujarat Trade Intelligence Active.**\n\nAsk me for real-time commodity pricing ranges, container freight benchmarks, and capacity forecasts across Gujarat export corridors.',
  risk: '🛡️ **Trade Risk & Integrity Scanner Active.**\n\nSubmit any supplier claim (such as a 5-day dispatch for chemical APIs) to verify audit feasibility and physical factory credibility.'
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
  const [suggestions, setSuggestions] = useState<string[]>([
    'Verified Paracetamol API manufacturers in Vatva GIDC',
    'Surat organic cotton textile mills with GOTS certification',
    'Morbi ceramic tile exporters for EU markets'
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeMode === 'sourcing') {
      setSuggestions([
        'Verified Paracetamol API manufacturers in Vatva GIDC',
        'Surat organic cotton textile mills with GOTS certification',
        'Morbi ceramic tile exporters for EU markets'
      ]);
    } else if (activeMode === 'document') {
      setSuggestions([
        'Check German customs rules for commercial invoice',
        'Certificate of Origin common clearance risks',
        'GSTIN & IEC verification checklist'
      ]);
    } else if (activeMode === 'rfq') {
      setSuggestions([
        'Draft RFQ for 5,000 kg Paracetamol API bulk',
        'Draft export RFQ for Morbi porcelain floor tiles',
        'What Incoterms should I specify for CIF Hamburg?'
      ]);
    } else if (activeMode === 'market') {
      setSuggestions([
        'Current Paracetamol API price benchmark USD/kg',
        'Ankleshwar specialty chemical export lead times',
        'Container shipping freight rates from Kandla/Mundra'
      ]);
    } else if (activeMode === 'risk') {
      setSuggestions([
        'Analyze risk of 5-day delivery offer on pharma chemicals',
        'How does GIDC physical geocoding audit work?',
        'Red flags to detect trading intermediaries'
      ]);
    }
  }, [activeMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeMode]);

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
        if (resp.suggestedPrompts && resp.suggestedPrompts.length > 0) {
          setSuggestions(resp.suggestedPrompts);
        }
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

  const renderFormattedMessage = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Heading 3 / 4
          if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
            const title = trimmed.replace(/^#{2,3}\s+/, '');
            return (
              <div key={idx} className="pt-1.5 pb-0.5">
                <span className="inline-flex items-center gap-1.5 font-black text-[12px] uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                  <Sparkles size={11} className="text-amber-400" />
                  {title}
                </span>
              </div>
            );
          }

          // Bullet point with bold prefix
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const cleanText = trimmed.replace(/^[-*]\s+/, '');
            const isWarning = cleanText.includes('⚠️') || cleanText.includes('Risk') || cleanText.includes('MISSING');
            return (
              <div 
                key={idx} 
                className={`pl-3 py-0.5 relative flex items-start gap-2 ${
                  isWarning ? 'bg-amber-500/15 -mx-1 px-2.5 py-1 rounded-lg border-l-2 border-amber-500 text-amber-200' : ''
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  {cleanText.split('**').map((chunk, cIdx) => (
                    cIdx % 2 === 1 ? (
                      <strong key={cIdx} className="font-extrabold text-white">
                        {chunk}
                      </strong>
                    ) : (
                      <span key={cIdx}>{chunk}</span>
                    )
                  ))}
                </div>
              </div>
            );
          }

          // Numbered list
          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+)\.\s+(.*)$/);
            if (match) {
              return (
                <div key={idx} className="flex items-start gap-2.5 pl-1 py-0.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-amber-400 font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/10">
                    {match[1]}
                  </span>
                  <div className="flex-1">
                    {match[2].split('**').map((chunk, cIdx) => (
                      cIdx % 2 === 1 ? (
                        <strong key={cIdx} className="font-extrabold text-white">
                          {chunk}
                        </strong>
                      ) : (
                        <span key={cIdx}>{chunk}</span>
                      )
                    ))}
                  </div>
                </div>
              );
            }
          }

          // Regular paragraph with bold support
          return (
            <p key={idx}>
              {trimmed.split('**').map((chunk, cIdx) => (
                cIdx % 2 === 1 ? (
                  <strong key={cIdx} className="font-extrabold text-white">
                    {chunk}
                  </strong>
                ) : (
                  <span key={cIdx}>{chunk}</span>
                )
              ))}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 py-6 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 h-[720px]">
        
        {/* Left Column: Modes & Moat Panel */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">Aartha AI Copilot</h3>
                <p className="text-[10px] text-amber-400 font-semibold">Grounded Trade Intelligence</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {modes.map((m) => {
                const Icon = m.icon;
                const isActive = activeMode === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => setActiveMode(m.key)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer select-none ${
                      isActive
                        ? 'border-amber-500 bg-gradient-to-r from-amber-500/20 to-amber-500/5 font-bold shadow-sm'
                        : 'border-white/5 bg-slate-950/50 hover:bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-slate-400'}`}>
                      <Icon size={16} />
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className={`text-xs leading-tight font-extrabold ${isActive ? 'text-amber-400' : 'text-white'}`}>
                        {m.label}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{m.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Industrial Corridor Moat Card */}
          <div className="bg-gradient-to-br from-slate-950 to-navy rounded-xl p-4 space-y-2.5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[10px] text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin size={11} /> Gujarat Corridor Coverage
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              Vatva · Ankleshwar · Morbi · Surat · Rajkot geocoded registries actively linked.
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
              <span>GSTIN Verified</span>
              <span>•</span>
              <span>ISO / WHO-GMP</span>
            </div>
          </div>
        </div>

        {/* Right Column: Chat Workspace */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full backdrop-blur-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-navy to-slate-950 p-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="font-extrabold text-sm tracking-wide text-white">
                  {modes.find(m => m.key === activeMode)?.label}
                </div>
                <div className="text-[10px] text-amber-400 font-semibold">
                  {modes.find(m => m.key === activeMode)?.desc}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                title="Reset conversation"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer select-none p-1.5 rounded-lg hover:bg-white/10 flex items-center gap-1 text-xs"
              >
                <RotateCcw size={13} />
                <span className="text-[11px] font-semibold">Reset</span>
              </button>
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2.5 py-1 rounded-full font-extrabold uppercase border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Engine
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
            {messages[activeMode].map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-md ${
                    isUser 
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold' 
                      : 'bg-slate-800 text-amber-400 border border-white/10'
                  }`}>
                    {isUser ? <User size={13} /> : <Bot size={13} />}
                  </div>
                  <div className={`p-4 rounded-2xl border shadow-md ${
                    isUser
                      ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white border-amber-500/50 rounded-tr-none'
                      : 'bg-slate-800/90 text-slate-200 border-white/10 rounded-tl-none backdrop-blur-md'
                  }`}>
                    {isUser ? (
                      <p className="text-[13px] leading-relaxed font-medium">{msg.text}</p>
                    ) : (
                      renderFormattedMessage(msg.text)
                    )}

                    {!isUser && activeMode === 'sourcing' && idx > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                        <Link 
                          href="/suppliers"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all no-underline"
                        >
                          <Building2 size={12} />
                          <span>Browse Verified Directory</span>
                          <ExternalLink size={11} />
                        </Link>
                        <Link 
                          href="/rfq"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white hover:text-amber-200 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 transition-all no-underline"
                        >
                          <FileEdit size={12} />
                          <span>Post Direct RFQ</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-3 p-3.5 bg-slate-800/70 rounded-2xl border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse max-w-[80%]">
                <RefreshCw size={14} className="animate-spin text-amber-500" />
                <span>Analyzing verified Gujarat corridor parameters...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Queries */}
          {suggestions.length > 0 && (
            <div className="p-3 bg-slate-950 border-t border-white/10 flex-shrink-0">
              <div className="flex items-center gap-1.5 mb-2 text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                <Sparkles size={11} />
                <span>Suggested Queries</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 text-[11px] font-medium px-3 py-1.5 rounded-xl border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer text-left flex items-center gap-1.5 shadow-sm hover:scale-[1.01]"
                  >
                    <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }} 
            className="p-3.5 bg-slate-950 border-t border-white/10 flex gap-2 flex-shrink-0 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${modes.find(m => m.key === activeMode)?.label} about Gujarat factories, specs...`}
              className="flex-1 bg-slate-900 text-white placeholder:text-slate-500 text-xs px-4 py-3 rounded-xl border border-white/15 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 font-medium transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-5 py-3 rounded-xl font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Send size={15} />
              <span className="text-xs">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
