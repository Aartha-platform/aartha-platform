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
      <div className="space-y-2 text-[13px] leading-relaxed text-text-primary">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Heading 3 / 4
          if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
            const title = trimmed.replace(/^#{2,3}\s+/, '');
            return (
              <div key={idx} className="pt-1.5 pb-0.5">
                <span className="inline-flex items-center gap-1.5 font-black text-[12px] uppercase tracking-wider text-navy bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                  <Sparkles size={11} className="text-amber-500" />
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
                  isWarning ? 'bg-amber-50 -mx-1 px-2.5 py-1 rounded-lg border-l-2 border-amber-500 text-amber-900 font-medium' : ''
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <div className="flex-1">
                  {cleanText.split('**').map((chunk, cIdx) => (
                    cIdx % 2 === 1 ? (
                      <strong key={cIdx} className="font-extrabold text-navy">
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
                  <span className="w-5 h-5 rounded-full bg-navy text-white font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                    {match[1]}
                  </span>
                  <div className="flex-1">
                    {match[2].split('**').map((chunk, cIdx) => (
                      cIdx % 2 === 1 ? (
                        <strong key={cIdx} className="font-extrabold text-navy">
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
                  <strong key={cIdx} className="font-extrabold text-navy">
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
    <div className="min-h-screen bg-cream font-sans text-text-primary py-6 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 h-[740px]">
        
        {/* Left Column: Modes & Moat Panel */}
        <div className="bg-white border border-border-default rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border-default">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-sm ring-2 ring-amber-400/20">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-navy">Aartha AI Copilot</h3>
                <p className="text-[10px] text-amber-700 font-bold">Grounded Trade Intelligence</p>
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
                        ? 'border-amber-500 bg-amber-50/80 font-bold shadow-xs'
                        : 'border-border-default bg-cream/50 hover:bg-amber-50/40 text-text-secondary hover:text-navy'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-amber-500 text-slate-950' : 'bg-white text-text-muted border border-border-default/60'}`}>
                      <Icon size={16} />
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className={`text-xs leading-tight font-extrabold ${isActive ? 'text-navy' : 'text-text-primary'}`}>
                        {m.label}
                      </div>
                      <div className="text-[10px] text-text-muted truncate">{m.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Industrial Corridor Moat Card */}
          <div className="bg-navy text-white rounded-xl p-4 space-y-2.5 border border-navy shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[10px] text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <MapPin size={11} /> Gujarat Corridor Coverage
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-white/90 leading-relaxed font-medium">
              Vatva · Ankleshwar · Morbi · Surat · Rajkot geocoded registries actively linked.
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/70">
              <span className="text-emerald-300 font-medium">GSTIN Verified</span>
              <span>•</span>
              <span className="text-amber-300 font-medium">ISO / WHO-GMP</span>
            </div>
          </div>
        </div>

        {/* Right Column: Chat Workspace */}
        <div className="bg-white border border-border-default rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="bg-navy p-4 flex items-center justify-between border-b border-navy-light flex-shrink-0 text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="font-extrabold text-sm tracking-wide text-white">
                  {modes.find(m => m.key === activeMode)?.label}
                </div>
                <div className="text-[10px] text-amber-300 font-semibold">
                  {modes.find(m => m.key === activeMode)?.desc}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                title="Reset conversation"
                className="text-white/70 hover:text-white transition-colors cursor-pointer select-none p-1.5 rounded-lg hover:bg-white/10 flex items-center gap-1 text-xs"
              >
                <RotateCcw size={13} />
                <span className="text-[11px] font-semibold">Reset</span>
              </button>
              <span className="bg-emerald-400/20 text-emerald-300 text-[9px] px-2.5 py-1 rounded-full font-extrabold uppercase border border-emerald-400/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Engine
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#faf9f5]">
            {messages[activeMode].map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-xs ${
                    isUser 
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold' 
                      : 'bg-white text-navy border border-border-default'
                  }`}>
                    {isUser ? <User size={13} /> : <Bot size={13} />}
                  </div>
                  <div className={`p-4 rounded-2xl border shadow-xs ${
                    isUser
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-semibold border-amber-400 rounded-tr-none'
                      : 'bg-white text-text-primary border-border-default rounded-tl-none'
                  }`}>
                    {isUser ? (
                      <p className="text-[13px] leading-relaxed font-semibold">{msg.text}</p>
                    ) : (
                      renderFormattedMessage(msg.text)
                    )}

                    {!isUser && activeMode === 'sourcing' && idx > 0 && (
                      <div className="mt-3 pt-3 border-t border-border-default flex items-center gap-2 flex-wrap">
                        <Link 
                          href="/suppliers"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-all no-underline"
                        >
                          <Building2 size={12} />
                          <span>Browse Verified Directory</span>
                          <ExternalLink size={11} />
                        </Link>
                        <Link 
                          href="/rfq"
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white hover:text-white/90 bg-navy hover:bg-navy-light px-3 py-1.5 rounded-lg border border-navy transition-all no-underline"
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
              <div className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-amber-400/40 text-amber-800 text-xs font-bold animate-pulse max-w-[80%] shadow-xs">
                <RefreshCw size={14} className="animate-spin text-amber-600" />
                <span>Analyzing verified Gujarat corridor parameters...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Queries */}
          {suggestions.length > 0 && (
            <div className="p-3 bg-white border-t border-border-default flex-shrink-0">
              <div className="flex items-center gap-1.5 mb-2 text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                <Sparkles size={11} className="text-amber-500" />
                <span>Suggested Queries</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="bg-cream hover:bg-amber-50 text-text-secondary hover:text-navy text-[11px] font-medium px-3 py-1.5 rounded-xl border border-border-default hover:border-amber-300 transition-all cursor-pointer text-left flex items-center gap-1.5 shadow-2xs hover:scale-[1.01]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
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
            className="p-3.5 bg-white border-t border-border-default flex gap-2 flex-shrink-0 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${modes.find(m => m.key === activeMode)?.label} about Gujarat factories, specs...`}
              className="flex-1 bg-cream text-text-primary placeholder:text-text-muted text-xs px-4 py-3 rounded-xl border border-border-default focus:outline-none focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/10 font-medium transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-5 py-3 rounded-xl font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
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
