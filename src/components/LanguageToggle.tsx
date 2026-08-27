'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation, Language } from '@/hooks/useTranslation';
import { Globe, ChevronDown, Check, Search, X } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export default function LanguageToggle({ className = '', variant = 'compact' }: LanguageToggleProps) {
  const { lang, setLang, supportedLanguages, currentLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filter languages based on search query
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return supportedLanguages;
    const q = searchQuery.toLowerCase().trim();
    return supportedLanguages.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q)
    );
  }, [searchQuery, supportedLanguages]);

  // Split into categories for enterprise grouping
  const globalLanguages = useMemo(
    () => filteredLanguages.filter((l) => l.category === 'global'),
    [filteredLanguages]
  );
  const regionalLanguages = useMemo(
    () => filteredLanguages.filter((l) => l.category === 'regional'),
    [filteredLanguages]
  );

  const handleSelect = (code: Language) => {
    setLang(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 text-white hover:text-amber-300 font-medium text-[11px] sm:text-xs transition-all duration-200 cursor-pointer select-none py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 shadow-sm"
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={`${t('common_select_language')}: ${currentLanguage.name}`}
      >
        {currentLanguage.flag && currentLanguage.flag !== '🌐' ? (
          <span className="text-xs leading-none">{currentLanguage.flag}</span>
        ) : (
          <Globe size={13} className="text-amber-400 flex-shrink-0" />
        )}
        <span className="font-semibold">{currentLanguage.nativeName.split(' ')[0]}</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 opacity-80 ${isOpen ? 'rotate-180 text-amber-400' : ''}`}
        />
      </button>

      {/* Enterprise Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-[100] text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
          {/* Header */}
          <div className="px-3.5 pt-1.5 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <Globe size={14} className="text-amber-500" />
              <span>{t('common_select_language')}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              {supportedLanguages.length} Locales
            </span>
          </div>

          {/* Search Filter */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common_search_language')}
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-amber-500 focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Language Items List */}
          <div className="max-h-72 overflow-y-auto px-1.5 py-1 space-y-2.5 custom-scrollbar">
            {filteredLanguages.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-400">
                No matching language found.
              </div>
            ) : (
              <>
                {/* Global Trade Corridor Group */}
                {globalLanguages.length > 0 && (
                  <div>
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {t('common_global_languages')}
                    </div>
                    <div className="space-y-0.5">
                      {globalLanguages.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => handleSelect(l.code)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all duration-150 cursor-pointer ${
                            lang === l.code
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-base flex-shrink-0 leading-none">{l.flag}</span>
                            <div className="min-w-0">
                              <div className="font-semibold text-xs leading-tight truncate">
                                {l.nativeName}
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
                                {l.name} · {l.region}
                              </div>
                            </div>
                          </div>
                          {lang === l.code && (
                            <Check size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 ml-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Indian Regional Manufacturing Hubs Group */}
                {regionalLanguages.length > 0 && (
                  <div>
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {t('common_regional_languages')}
                    </div>
                    <div className="space-y-0.5">
                      {regionalLanguages.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => handleSelect(l.code)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all duration-150 cursor-pointer ${
                            lang === l.code
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-base flex-shrink-0 leading-none">{l.flag}</span>
                            <div className="min-w-0">
                              <div className="font-semibold text-xs leading-tight truncate">
                                {l.nativeName}
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
                                {l.name} · {l.region}
                              </div>
                            </div>
                          </div>
                          {lang === l.code && (
                            <Check size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 ml-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
