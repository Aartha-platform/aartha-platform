"use client";

import React, { useState } from 'react';
import { Sparkles, MessageSquare, Send, CheckCircle2, Shield, User, Building2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeedbackPortalClient() {
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState<'buyer' | 'supplier' | 'manufacturer' | 'other'>('buyer');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const promptStarters = [
    'What was confusing about finding a supplier?',
    'What information was missing on factory profiles?',
    'How was your RFQ or onboarding experience?',
    'What feature would make Aartha 10x more useful for your business?'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      setError('Please write at least a few words describing your experience.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          userRole,
          email: email.trim() || undefined,
          source: 'open_portal',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedRefId(data.referenceId || 'FB-ACKNOWLEDGED');
      } else {
        setError(data.error || 'Failed to submit feedback. Please try again.');
      }
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setMessage('');
    setEmail('');
    setSubmittedRefId(null);
    setError(null);
  };

  return (
    <div className="bg-slate-50 dark:bg-navy-dark font-sans min-h-screen py-12 text-text-primary transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-1.5 rounded-full text-xs font-black border border-amber-500/25">
            <Sparkles size={13} className="animate-pulse" />
            <span>DIRECT PRODUCT FEEDBACK</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl text-navy dark:text-white font-extrabold uppercase tracking-tight">
            Tell Us What Happened
          </h1>
          
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            No rigid checkboxes or surveys. Tell us what confused you, what frustrated you, what worked, and what you expected to find.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!submittedRefId ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-navy border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Prompt Starters */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Looking for ideas? Tap any question to start:
                </label>
                <div className="flex flex-wrap gap-2">
                  {promptStarters.map((starter, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMessage(prev => (prev ? `${prev}\n\n${starter} ` : `${starter} `))}
                      className="text-[11px] bg-slate-100 dark:bg-white/5 hover:bg-amber-500/10 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 border border-black/5 dark:border-white/10 px-3 py-1.5 rounded-xl transition-all text-left cursor-pointer"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Main Open Text Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy dark:text-white">
                    Your Thoughts & Experience <span className="text-amber-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write freely... e.g. I looked for precision CNC tooling suppliers, but I couldn't see minimum order quantities. Also, the RFQ submission was smooth, but I wanted to attach technical drawings directly."
                    className="w-full bg-slate-50 dark:bg-navy-light border border-black/10 dark:border-white/15 rounded-2xl p-4 text-xs sm:text-sm text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all leading-relaxed placeholder:text-slate-400"
                    required
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 px-1 font-medium">
                    <span>Be as detailed as you like. Every message is reviewed by our engineering team.</span>
                    <span>{message.length} characters</span>
                  </div>
                </div>

                {/* Role Pill Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy dark:text-white">
                    I am using Aartha as a:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'buyer', label: 'Buyer', icon: User },
                      { id: 'supplier', label: 'Manufacturer', icon: Building2 },
                      { id: 'other', label: 'Industry Expert', icon: Sparkles },
                      { id: 'other', label: 'Other', icon: HelpCircle },
                    ].map((role, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setUserRole(role.id as any)}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          userRole === role.id
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-xs'
                            : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-300 border-black/5 dark:border-white/10 hover:border-black/20'
                        }`}
                      >
                        <role.icon size={13} />
                        <span>{role.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Email Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy dark:text-white">
                    Email Address <span className="text-slate-400 font-normal text-[10px]">(Optional — only if you want our team to reply)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-slate-50 dark:bg-navy-light border border-black/10 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                    {error}
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="w-full btn-amber py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'Sending Feedback...' : 'Send Feedback to Engineering Team'}</span>
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-navy border border-black/10 dark:border-white/10 rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-sm"
            >
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-navy dark:text-white uppercase tracking-tight">
                  Thank You for Your Feedback
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your message was received and logged with reference ID <strong className="text-amber-500">{submittedRefId}</strong>. Our product engineers read every submission to shape Aartha's next updates.
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold border border-black/15 dark:border-white/20 text-navy dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  Send Another Note
                </button>
                <a
                  href="/"
                  className="btn-amber px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  Return to Homepage
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer note */}
        <div className="mt-8 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Shield size={13} className="text-emerald-500" />
          <span>Your privacy is protected. Feedback is never shared publicly or sold. Submissions are analyzed strictly to improve platform workflows and resolve bottlenecks.</span>
        </div>
      </div>
    </div>
  );
}
