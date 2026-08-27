"use client";

import { useState, useEffect } from 'react';
import { Send, ShieldAlert, Sparkles, MessageSquare, Paperclip, CheckCheck } from 'lucide-react';
import { DashboardMessage } from '../types';

interface ConversationPanelProps {
  messages: DashboardMessage[];
  activeThreadId?: string;
  onThreadChange?: (id: string) => void;
  onSendMessage?: (supplierName: string, text: string) => void;
  isSupplierView?: boolean;
}

const mockTranslations: Record<string, string> = {
  'We can offer a 5% discount on orders above 500 units. Please review the proforma invoice attached in the document section.':
    'हम 500 से अधिक इकाइयों के ऑर्डर पर 5% छूट की पेशकश कर सकते हैं। कृपया दस्तावेज़ अनुभाग में संलग्न प्रोफार्मा चालान की समीक्षा करें।',
  'GOTS organic validation report is ready. Shall we ship the swatch sample roll to your Mundra port freight forwarder?':
    'GOTS जैविक सत्यापन रिपोर्ट तैयार है। क्या हम स्वैच नमूना रोल आपके मुंद्रा बंदरगाह फ्रेट फारवर्डर को भेजें?',
  'Please send us your target drawing specifications for the carbide teeth boring tools.':
    'कृपया हमें कार्बाइड दांत बोरिंग टूल के लिए अपने लक्षित ड्राइंग विनिर्देश भेजें।',
};

export default function ConversationPanel({
  messages: initialMessages,
  activeThreadId: propActiveThreadId,
  onThreadChange,
  onSendMessage,
  isSupplierView = false,
}: ConversationPanelProps) {
  const [threads, setThreads] = useState<DashboardMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('artha_buyer_chat_threads');
      if (stored) return JSON.parse(stored);
    }
    return initialMessages;
  });

  const [activeThreadId, setActiveThreadId] = useState(() => {
    return propActiveThreadId || initialMessages[0]?.id || '';
  });

  const [chatInputs, setChatInputs] = useState<Record<string, string>>({});
  const [isTranslateActive, setIsTranslateActive] = useState(false);
  const [typingThreadId, setTypingThreadId] = useState<string | null>(null);

  const [localHistory, setLocalHistory] = useState<Record<string, Array<{ sender: 'me' | 'them'; text: string; time: string; attachment?: string }>>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('artha_buyer_chat_history');
      if (stored) return JSON.parse(stored);
    }
    return {
      'm1': [
        { sender: 'them', text: 'We can offer a 5% discount on orders above 500 units. Please review the proforma invoice attached in the document section.', time: '2 hours ago' },
        { sender: 'me', text: 'Thank you. We will verify the ISO calibration reports and get back with the advance deposit instructions.', time: '1 hour ago' }
      ],
      'm2': [
        { sender: 'them', text: 'GOTS organic validation report is ready. Shall we ship the swatch sample roll to your Mundra port freight forwarder?', time: 'Yesterday' }
      ],
      'm3': [
        { sender: 'them', text: 'Please send us your target drawing specifications for the carbide teeth boring tools.', time: '3 days ago' }
      ],
      'm4': [
        { sender: 'them', text: 'We can meet your specifications. Lead time would be around 4-6 weeks depending on GIDC power logs.', time: '5 days ago' }
      ]
    };
  });

  // Sync prop active thread id
  useEffect(() => {
    if (propActiveThreadId) {
      setActiveThreadId(propActiveThreadId);
    }
  }, [propActiveThreadId]);

  // Persist threads list
  useEffect(() => {
    localStorage.setItem('artha_buyer_chat_threads', JSON.stringify(threads));
  }, [threads]);

  // Persist histories log
  useEffect(() => {
    localStorage.setItem('artha_buyer_chat_history', JSON.stringify(localHistory));
  }, [localHistory]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];
  const activeChatLog = activeThread ? (localHistory[activeThread.id] || []) : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread) return;
    const text = chatInputs[activeThread.id] || '';
    if (!text.trim()) return;

    // Update message logs locally
    const newMessage = { sender: 'me' as const, text, time: 'Just now' };
    setLocalHistory((prev) => ({
      ...prev,
      [activeThread.id]: [...(prev[activeThread.id] || []), newMessage],
    }));

    // Update preview in thread lists
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? { ...t, preview: text, timestamp: 'Just now', unread: false }
          : t
      )
    );

    // Call callback if exists
    onSendMessage?.(activeThread.supplierName, text);

    // Clear input
    setChatInputs((prev) => ({ ...prev, [activeThread.id]: '' }));

    // Trigger simulated reply after a delay
    const textLower = text.toLowerCase();
    const threadId = activeThread.id;
    const supplierName = activeThread.supplierName;

    setTypingThreadId(threadId);
    setTimeout(() => {
      setTypingThreadId(null);
      
      let replyText = `Thank you for details. Our team at ${supplierName} is checking our current GIDC capacity metrics. We will get back to you with specs confirmation within 2 hours.`;
      
      if (textLower.includes('discount') || textLower.includes('lower price') || textLower.includes('cheaper')) {
        replyText = `We can offer a discount (up to 5-7%) if your total order volume exceeds our standard production batch. Let us schedule a call to review the target margins.`;
      } else if (textLower.includes('sample') || textLower.includes('test') || textLower.includes('swatch')) {
        replyText = `Samples can be dispatched from our GIDC facility. Please provide your shipping carrier details or your Mundra port freight forwarder account number.`;
      } else if (textLower.includes('spec') || textLower.includes('drawing') || textLower.includes('pdf')) {
        replyText = `We have received your custom drawing spec. Our technical engineers are evaluating the tolerances and CNC parameters now.`;
      } else if (textLower.includes('price') || textLower.includes('cost') || textLower.includes('how much')) {
        replyText = `Current bulk pricing is guided by Gujarat port and mandi rates. We'll update the final quote on your Compare Quotes board based on custom packaging.`;
      } else if (textLower.includes('urgency') || textLower.includes('fast') || textLower.includes('quick')) {
        replyText = `Standard turnaround is 4-6 weeks for GIDC compliance checks. For priority scheduling, we recommend declaring your Sourcing Authority and upgrading to Pro.`;
      }

      const supplierReply = {
        sender: 'them' as const,
        text: replyText,
        time: 'Just now'
      };

      setLocalHistory((prev) => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), supplierReply]
      }));

      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, preview: replyText, timestamp: 'Just now', unread: true }
            : t
        )
      );

      // Trigger a custom event for new message sound/alert if outer controller wants to listen
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('artha_new_message_alert', { 
          detail: { supplierName, text: replyText } 
        }));
      }

    }, 2000);
  };

  const handleInputChange = (val: string) => {
    if (!activeThread) return;
    setChatInputs((prev) => ({ ...prev, [activeThread.id]: val }));
  };

  const handleAttachFile = () => {
    if (!activeThread) return;
    // Add mock attachment to chat log
    const filename = `drawing_spec_v2_${Date.now().toString().slice(-4)}.pdf`;
    const newMessage = {
      sender: 'me' as const,
      text: `📎 Attached verification document: ${filename}`,
      time: 'Just now',
      attachment: filename,
    };
    setLocalHistory((prev) => ({
      ...prev,
      [activeThread.id]: [...(prev[activeThread.id] || []), newMessage],
    }));
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? { ...t, preview: `Attached file: ${filename}`, timestamp: 'Just now', unread: false }
          : t
      )
    );

    // Trigger simulated reply for file attachment
    const threadId = activeThread.id;
    const supplierName = activeThread.supplierName;

    setTypingThreadId(threadId);
    setTimeout(() => {
      setTypingThreadId(null);
      const replyText = `We received the drawing spec document: ${filename}. Our plant technical team is reviewing this against our machining capacities now.`;
      const supplierReply = {
        sender: 'them' as const,
        text: replyText,
        time: 'Just now'
      };
      setLocalHistory((prev) => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), supplierReply]
      }));
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, preview: replyText, timestamp: 'Just now', unread: true }
            : t
        )
      );
    }, 2000);
  };

  if (!activeThread) {
    return (
      <div className="bg-white border border-border-default rounded-xl p-8 text-center text-text-muted font-semibold">
        No active sourcing messages.
      </div>
    );
  }

  return (
    <div className="bg-white border border-border-default rounded-xl overflow-hidden min-h-[450px] flex shadow-2xs font-sans text-xs">
      {/* Threads List */}
      <div className="w-56 md:w-64 border-r border-border-default divide-y divide-border-default/60 flex-shrink-0 overflow-y-auto">
        {threads.map((msg) => (
          <button
            key={msg.id}
            onClick={() => {
              setActiveThreadId(msg.id);
              onThreadChange?.(msg.id);
              // Mark read locally
              setThreads((prev) => prev.map((t) => (t.id === msg.id ? { ...t, unread: false } : t)));
            }}
            className={`w-full p-3 text-left hover:bg-cream-secondary/20 block cursor-pointer transition-colors ${
              msg.id === activeThreadId ? 'bg-cream-secondary/40 border-l-4 border-gold' : ''
            }`}
          >
            <div className="flex justify-between items-baseline mb-0.5">
              <span className="font-bold text-xs text-text-primary truncate block max-w-[120px]">
                {msg.supplierName}
              </span>
              <span className="text-[8px] text-text-muted font-medium ml-2">{msg.timestamp}</span>
            </div>
            <p className="text-[11px] text-text-secondary truncate leading-normal">
              {msg.preview}
            </p>
          </button>
        ))}
      </div>

      {/* Chat logs */}
      <div className="flex-1 flex flex-col justify-between bg-cream/10 p-4">
        {/* Chat Header Actions */}
        <div className="border-b border-border-default/40 pb-2.5 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="bg-cream border border-border-default px-2 py-0.5 rounded text-[9px] text-text-muted font-semibold flex items-center gap-1.5">
              <ShieldAlert size={10} className="text-gold" />
              Secure geolinked corridor chat
            </span>
          </div>
          <button
            onClick={() => setIsTranslateActive(!isTranslateActive)}
            className={`px-2 py-1 rounded text-[9px] font-bold border transition-colors flex items-center gap-1 cursor-pointer select-none ${
              isTranslateActive
                ? 'bg-gold text-white border-gold'
                : 'bg-white text-text-secondary border-border-strong hover:bg-cream-secondary'
            }`}
          >
            <Sparkles size={10} />
            <span>{isTranslateActive ? 'Auto-Translate: On' : 'Auto-Translate (Hindi)'}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 py-3 text-xs">
          {activeChatLog.map((chat, idx) => {
            const hasTranslation = isTranslateActive && chat.sender === 'them' && mockTranslations[chat.text];
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border max-w-[80%] space-y-1 ${
                  chat.sender === 'me'
                    ? 'bg-trust-blue-bg/40 border-trust-blue/15 ml-auto'
                    : 'bg-white border-border-default'
                }`}
              >
                <div className="font-bold text-[9px] uppercase tracking-wider text-text-muted">
                  {chat.sender === 'me' ? (isSupplierView ? 'Me (Supplier desk)' : 'Me (Buyer desk)') : activeThread.supplierName}
                </div>
                <p className="text-xs text-text-secondary leading-normal font-semibold">
                  {chat.text}
                </p>
                {hasTranslation && (
                  <p className="text-xs text-gold/90 border-t border-border-default/45 pt-1.5 mt-1 font-semibold italic">
                    📢 {mockTranslations[chat.text]}
                  </p>
                )}
                <div className="flex justify-end items-center gap-1 text-[8px] text-text-muted font-medium">
                  <span>{chat.time}</span>
                  {chat.sender === 'me' && (
                    <span className="flex items-center gap-0.5 text-trust-green font-bold">
                      <CheckCheck size={10} />
                      {chat.time === 'Just now' ? 'Sent' : 'Read'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {typingThreadId === activeThread.id && (
            <div className="p-3 rounded-lg border border-border-default bg-white max-w-[80%] space-y-1 animate-pulse">
              <div className="font-bold text-[9px] uppercase tracking-wider text-text-muted">
                {activeThread.supplierName}
              </div>
              <div className="flex items-center gap-1 text-text-secondary py-1.5 text-xs">
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[10px] text-text-muted pl-1 font-semibold">typing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="border-t border-border-default/50 pt-3 flex gap-2">
          <button
            type="button"
            onClick={handleAttachFile}
            title="Attach spec file / drawing sheets"
            className="p-2 bg-white hover:bg-cream-secondary border border-border-strong text-text-secondary rounded-lg flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors"
          >
            <Paperclip size={14} />
          </button>
          <input
            type="text"
            value={chatInputs[activeThread.id] || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type a message to discuss quotes or specs..."
            className="bg-white border border-border-strong rounded-lg px-3 py-2 text-xs flex-1 focus:outline-none focus:border-navy"
          />
          <button
            type="submit"
            className="bg-navy hover:bg-navy-light text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
          >
            <Send size={12} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
