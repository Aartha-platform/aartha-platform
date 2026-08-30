"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  X, Sparkles, Send, Bot, User, RefreshCw, RotateCcw, 
  Building2, FileCheck2, FileEdit, TrendingUp, ShieldAlert, 
  ExternalLink, CheckCircle2, Shield, Maximize2
} from 'lucide-react';
import { generateAssistantReply } from '@/lib/assistantModes';

interface AIAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const modes = [
  { key: 'sourcing', label: 'Sourcing', icon: Building2, subtitle: 'Find verified factories' },
  { key: 'document', label: 'Doc Intel', icon: FileCheck2, subtitle: 'Customs & compliance' },
  { key: 'rfq', label: 'RFQ Copilot', icon: FileEdit, subtitle: 'Draft technical specs' },
  { key: 'market', label: 'Market Intel', icon: TrendingUp, subtitle: 'Gujarat price benchmarks' },
  { key: 'risk', label: 'Risk Scan', icon: ShieldAlert, subtitle: 'Audit & fraud screening' }
] as const;

const initialGreetings: Record<string, string> = {
  sourcing: '👋 **Welcome to Aartha Sourcing Intelligence!**\n\nAsk me to locate verified factories across Gujarat GIDC industrial clusters (Ankleshwar, Vatva, Morbi, Surat, Rajkot), compare trust scores, or inspect certifications.',
  document: '📑 **Document Intelligence Copilot Ready.**\n\nPaste invoice details, packing list specs, or Certificate of Origin drafts to verify customs readiness for USA, EU, Germany, and UAE ports.',
  rfq: '📝 **Smart RFQ Drafting Copilot Active.**\n\nTell me what product, volume, or GIDC cluster you need. I will structure a complete, machine-readable RFQ with exact technical parameters.',
  market: '📈 **Gujarat Trade Intelligence Active.**\n\nAsk me for real-time commodity pricing ranges, container freight benchmarks, and capacity forecasts across Gujarat export corridors.',
  risk: '🛡️ **Trade Risk & Integrity Scanner Active.**\n\nSubmit any supplier claim (such as a 5-day dispatch for chemical APIs) to verify audit feasibility and physical factory credibility.'
};

export default function AIAssistantPanel({ isOpen, onClose }: AIAssistantPanelProps) {
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
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeMode, isOpen]);

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
    <>
      {/* Light Frosted Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-navy/30 z-[999] backdrop-blur-xs transition-opacity duration-300" 
          onClick={onClose} 
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#faf9f5] text-text-primary shadow-2xl z-[1000] transition-transform duration-300 ease-out overflow-hidden flex flex-col font-sans border-l border-border-default ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Header — Navy signature */}
        <div className="bg-navy p-4 border-b border-navy-light flex-shrink-0 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md ring-2 ring-amber-400/30">
                <Sparkles size={18} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm tracking-wide text-white">
                    Aartha Sourcing Copilot
                  </h3>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                </div>
                <p className="text-[11px] text-amber-300 font-medium">
                  Verified Gujarat Factory & Trade Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearChat}
                title="Reset conversation"
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1 text-xs select-none"
              >
                <RotateCcw size={14} />
                <span className="hidden sm:inline text-[11px] font-semibold">Reset</span>
              </button>
              <Link
                href="/ai-assistant"
                onClick={onClose}
                title="Open Full Workspace"
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1 text-xs select-none no-underline border border-white/10 hover:border-white/20 bg-white/5"
              >
                <Maximize2 size={13} className="text-amber-400" />
                <span className="hidden sm:inline text-[11px] font-semibold text-amber-300">Open Full Workspace</span>
              </Link>
              <button
                onClick={onClose}
                title="Close panel"
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer select-none"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Micro Moat Indicators */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-white/80">
            <span className="flex items-center gap-1 font-medium text-emerald-300">
              <CheckCircle2 size={11} /> 100% GIDC Geocoded
            </span>
            <span className="flex items-center gap-1 font-medium text-amber-300">
              <Shield size={11} /> GSTIN & IEC Verified
            </span>
            <span className="flex items-center gap-1 font-mono uppercase bg-white/10 px-2 py-0.5 rounded border border-white/15 text-white/90">
              Real-time AI
            </span>
          </div>
        </div>

        {/* Mode Selector Segmented Bar */}
        <div className="p-2.5 bg-white border-b border-border-default flex-shrink-0">
          <div className="grid grid-cols-5 gap-1 bg-cream p-1 rounded-xl border border-border-default">
            {modes.map((m) => {
              const Icon = m.icon;
              const isActive = activeMode === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setActiveMode(m.key)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-center transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 font-black shadow-xs'
                      : 'text-text-muted hover:text-navy hover:bg-white/80 font-semibold'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-slate-950' : 'text-text-muted'} />
                  <span className="text-[10px] mt-1 tracking-tight truncate w-full">
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#faf9f5]">
          {messages[activeMode].map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[90%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div 
                  className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-xs ${
                    isUser 
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black ring-1 ring-amber-400/40' 
                      : 'bg-white text-navy border border-border-default ring-1 ring-black/5'
                  }`}
                >
                  {isUser ? <User size={13} /> : <Bot size={13} />}
                </div>

                <div 
                  className={`p-4 rounded-2xl border shadow-xs ${
                    isUser
                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-semibold border-amber-400 rounded-tr-none'
                      : 'bg-white text-text-primary border-border-default rounded-tl-none'
                  }`}
                >
                  {isUser ? (
                    <p className="text-[13px] leading-relaxed font-semibold">{msg.text}</p>
                  ) : (
                    renderFormattedMessage(msg.text)
                  )}

                  {/* Contextual Action Link for Sourcing / RFQ */}
                  {!isUser && activeMode === 'sourcing' && idx > 0 && (
                    <div className="mt-3 pt-3 border-t border-border-default flex items-center gap-2 flex-wrap">
                      <Link 
                        href="/suppliers"
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-all no-underline"
                      >
                        <Building2 size={12} />
                        <span>Browse Verified Directory</span>
                        <ExternalLink size={11} />
                      </Link>
                      <Link 
                        href="/rfq"
                        onClick={onClose}
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

        {/* Interactive Suggested Prompts */}
        {suggestions.length > 0 && (
          <div className="p-3 bg-white border-t border-border-default flex-shrink-0">
            <div className="flex items-center gap-1.5 mb-2 text-[10px] uppercase font-bold text-amber-700 tracking-wider">
              <Sparkles size={11} className="text-amber-500" />
              <span>Suggested Queries</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[90px] overflow-y-auto">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="bg-cream hover:bg-amber-50 text-text-secondary hover:text-navy text-[11px] font-medium px-3 py-1.5 rounded-xl border border-border-default hover:border-amber-300 transition-all cursor-pointer text-left flex items-center gap-1.5 shadow-2xs hover:scale-[1.01]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="truncate max-w-[380px]">{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }} 
          className="p-3.5 bg-white border-t border-border-default flex gap-2 flex-shrink-0 items-center"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${modes.find(m => m.key === activeMode)?.label} about Gujarat factories, specs...`}
              className="w-full bg-cream text-text-primary placeholder:text-text-muted text-xs px-4 py-3 rounded-xl border border-border-default focus:outline-none focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/10 font-medium transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 p-3 rounded-xl font-bold flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            title="Send query"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </>
  );
}
