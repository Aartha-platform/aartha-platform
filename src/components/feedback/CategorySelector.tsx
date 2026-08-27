"use client";

import React from 'react';
import { ShoppingBag, Truck, Factory, User } from 'lucide-react';
import { motion } from 'framer-motion';

export type UserCategory = 'buyer' | 'supplier' | 'manufacturer' | 'other';

interface CategorySelectorProps {
  onSelect: (category: UserCategory) => void;
  selectedCategory?: UserCategory;
}

export default function CategorySelector({ onSelect, selectedCategory }: CategorySelectorProps) {
  const categories = [
    {
      id: 'buyer' as UserCategory,
      title: 'Buyer',
      description: 'I am sourcing products, looking for verified factories or suppliers, and managing orders.',
      icon: ShoppingBag,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-500/10 text-blue-500',
    },
    {
      id: 'supplier' as UserCategory,
      title: 'Supplier',
      description: 'I am a distributor or supplier looking to receive RFQs, submit quotes, and sell industrial goods.',
      icon: Truck,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      id: 'manufacturer' as UserCategory,
      title: 'Manufacturer / OEM',
      description: 'I run a manufacturing plant or factory, producing custom goods and seeking direct buyer connections.',
      icon: Factory,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-500/10 text-amber-500',
    },
    {
      id: 'other' as UserCategory,
      title: 'Other User',
      description: 'I am a trade consultant, inspector, logistics provider, or casual visitor checking out Aartha.',
      icon: User,
      color: 'from-slate-500/20 to-zinc-500/20 border-slate-500/30 text-slate-600 dark:text-slate-400',
      iconBg: 'bg-slate-500/10 text-slate-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto px-4 mt-6">
      {categories.map((cat, idx) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;
        
        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            onClick={() => onSelect(cat.id)}
            className={`glass-panel p-6 rounded-2xl cursor-pointer hover-lift relative overflow-hidden flex flex-col justify-between border-2 transition-all duration-300 ${
              isSelected 
                ? 'border-gold bg-gold/5 dark:bg-gold/10 ring-2 ring-gold/20 shadow-premium-lg'
                : 'border-black/5 dark:border-white/5 hover:border-gold/30 hover:bg-white/95 dark:hover:bg-[var(--surface-2)]/90 shadow-premium'
            }`}
          >
            {/* Top background accent card */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${cat.color} rounded-bl-full opacity-30 -mr-6 -mt-6 pointer-events-none`} />

            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${cat.iconBg} flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
                <h3 className="type-h3 text-navy dark:text-white font-extrabold tracking-tight">
                  {cat.title}
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                {cat.description}
              </p>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${
                isSelected 
                  ? 'bg-gold/20 text-gold-text dark:text-gold border-gold/30' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent'
              }`}>
                {isSelected ? 'Selected' : 'Select'}
              </span>
              
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  ✓
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
