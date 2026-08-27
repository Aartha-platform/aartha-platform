"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, ShieldCheck, Database, Zap } from 'lucide-react';
import CategorySelector, { UserCategory } from './CategorySelector';
import FeedbackForm from './FeedbackForm';
import { motion } from 'framer-motion';

export default function FeedbackPortalClient() {
  const [selectedCategory, setSelectedCategory] = useState<UserCategory | null>(null);
  const [stats, setStats] = useState<{ totalCount: number } | null>(null);

  useEffect(() => {
    fetch('/api/feedback/stats')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && typeof data.totalCount === 'number') {
          setStats({ totalCount: data.totalCount });
        }
      })
      .catch((err) => console.warn('Feedback stats notice:', err));
  }, []);

  const handleCategorySelect = (category: UserCategory) => {
    setSelectedCategory(category);
  };

  const handleBackToCategory = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="bg-cream font-sans min-h-screen py-12 text-text-primary transition-colors duration-200">
      <div className="container-site max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 space-y-4 px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-1.5 rounded-full text-xs font-black border border-amber-500/25"
          >
            <Sparkles size={13} className="animate-pulse" />
            <span>AARTHA FEEDBACK SYSTEM</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="type-hero-compact text-navy dark:text-white font-extrabold uppercase tracking-tight"
          >
            Product Discovery & Market Research
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-300 text-sm max-w-xl mx-auto leading-relaxed font-medium"
          >
            Your problems drive our product roadmap. Share what is broken, what workflow bottlenecks you face, and what features you need to grow your trade.
          </motion.p>
        </div>

        {/* Benefits bar */}
        {!selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 max-w-2xl mx-auto mb-8 px-4"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-[var(--surface)]/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-black/5 dark:border-white/5">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>No Login Required (Anonymous)</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-[var(--surface)]/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-black/5 dark:border-white/5">
              <Database size={14} className="text-blue-500" />
              <span>Direct Sourcing Corridor Match</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-[var(--surface)]/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-black/5 dark:border-white/5">
              <Zap size={14} className="text-amber-500 animate-bounce" />
              <span>AI-Driven Feature Pipeline</span>
            </div>
          </motion.div>
        )}

        {/* Main Content Area */}
        <div className="min-h-[400px]">
          {!selectedCategory ? (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="type-h3 text-navy dark:text-white font-extrabold mb-1">
                  Select User Category
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  Choose your role to load trade-specific questions
                </p>
              </div>

              <CategorySelector
                onSelect={handleCategorySelect}
                selectedCategory={selectedCategory || undefined}
              />

              {stats && stats.totalCount > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-12"
                >
                  <p className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <MessageSquare size={14} className="text-gold" />
                    Join <span className="text-gold font-extrabold">{stats.totalCount}</span> business owners who shaped the corridor.
                  </p>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto px-4">
                <button
                  onClick={handleBackToCategory}
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-gold transition-colors duration-200"
                >
                  ← Change Category
                </button>
                <div className="mt-3">
                  <span className="text-[10px] uppercase font-black tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                    Category: {selectedCategory}
                  </span>
                </div>
              </div>

              <FeedbackForm
                initialCategory={selectedCategory}
                onBackToCategory={handleBackToCategory}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
