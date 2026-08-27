'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { Language } from '@/i18n/types';
import { locales } from '@/i18n/locales';
import {
  EVENT_KEY,
  STORAGE_KEY,
  LANGUAGE_MAP,
  detectInitialLanguage,
  syncGoogleTranslateCookie,
  syncDocumentDirection,
} from '@/i18n/config';

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
    googleTranslateCombo?: HTMLSelectElement | null;
  }
}

/**
 * Enterprise Full-Site Dynamic Translation Bridge.
 * 
 * Combines two high-performance translation strategies:
 * 1. Tier 1: Instant In-Memory DOM Localizer (0ms latency, zero third-party dependency)
 *    Maps and translates every UI phrase across all 10 language dictionaries directly.
 * 2. Tier 2: Dynamic Google Translate Bridge
 *    Handles unkeyed user-generated content, supplier descriptions, and deep route trees.
 */
export default function AutoTranslationBridge() {
  const pathname = usePathname();
  const isInitializedRef = useRef(false);
  const currentLangRef = useRef<Language>('en');

  // Fast In-Memory DOM Scanner for Instant 100% Full-Site Localization
  const applyDOMTextReplacements = (targetLang: Language) => {
    if (typeof document === 'undefined') return;

    currentLangRef.current = targetLang;
    syncDocumentDirection(targetLang);

    if (targetLang === 'en') {
      return;
    }

    const enDict = locales.en;
    const targetDict = locales[targetLang];
    if (!targetDict) return;

    // Create lookup pairs sorted by length descending to prevent partial match collisions
    const translationPairs = Object.keys(enDict)
      .map((key) => {
        const k = key as keyof typeof enDict;
        return {
          enText: enDict[k]?.trim(),
          targetText: targetDict[k]?.trim(),
        };
      })
      .filter((pair) => pair.enText && pair.targetText && pair.enText !== pair.targetText)
      .sort((a, b) => b.enText.length - a.enText.length);

    try {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName.toLowerCase();
            if (['script', 'style', 'noscript', 'textarea', 'input'].includes(tag)) {
              return NodeFilter.FILTER_REJECT;
            }
            if (parent.closest('[data-no-translate]')) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      let currentNode = walker.nextNode();
      while (currentNode) {
        const originalText = currentNode.nodeValue;
        if (originalText && originalText.trim().length > 0) {
          const trimmed = originalText.trim();
          for (const pair of translationPairs) {
            if (trimmed === pair.enText) {
              currentNode.nodeValue = originalText.replace(pair.enText, pair.targetText);
              break;
            }
          }
        }
        currentNode = walker.nextNode();
      }
    } catch {
      // DOM walker safety fallback
    }
  };

  // Google Translate Script Bridge
  const applyGoogleTranslateToDOM = (lang: Language) => {
    syncGoogleTranslateCookie(lang);

    const meta = LANGUAGE_MAP.get(lang);
    const targetGoogleCode = meta?.googleCode || lang;

    try {
      const selectEl = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (selectEl) {
        selectEl.value = targetGoogleCode;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch {
      // Ignore
    }
  };

  const handleLanguageChange = (lang: Language) => {
    applyDOMTextReplacements(lang);
    applyGoogleTranslateToDOM(lang);
  };

  useEffect(() => {
    // Define global initialization callback for Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,gu,hi,de,es,fr,ar,zh-CN,ja,ru',
            autoDisplay: false,
            layout: window.google.translate.TranslateElement.InlineLayout?.SIMPLE,
          },
          'google_translate_element'
        );
        isInitializedRef.current = true;

        const currentLang = detectInitialLanguage();
        if (currentLang !== 'en') {
          setTimeout(() => applyGoogleTranslateToDOM(currentLang), 300);
        }
      }
    };

    // Apply initial stored language immediately on load
    const initial = detectInitialLanguage();
    if (initial !== 'en') {
      setTimeout(() => applyDOMTextReplacements(initial), 50);
    }

    // Listen for custom language changed events from LanguageToggle
    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail) {
        handleLanguageChange(customEvent.detail);
      }
    };

    window.addEventListener(EVENT_KEY, handleEvent);

    return () => {
      window.removeEventListener(EVENT_KEY, handleEvent);
    };
  }, []);

  // Re-verify translation on route change
  useEffect(() => {
    try {
      const savedLang = (localStorage.getItem(STORAGE_KEY) as Language) || 'en';
      if (savedLang !== 'en') {
        setTimeout(() => {
          handleLanguageChange(savedLang);
        }, 100);
      }
    } catch {
      // Ignore
    }
  }, [pathname]);

  return (
    <>
      {/* Invisible anchor element for Google Translate Script */}
      <div
        id="google_translate_element"
        className="hidden"
        style={{ display: 'none', visibility: 'hidden' }}
        aria-hidden="true"
      />

      {/* Load Translation Engine asynchronously */}
      <Script
        id="google-translate-script"
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
