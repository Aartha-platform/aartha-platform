'use client';

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { categories } from '../data/categories';
import { suppliers } from '../data/suppliers';
import { useTranslation } from '@/hooks/useTranslation';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string, categoryId?: string) => void;
  initialQuery?: string;
  initialCategory?: string;
  className?: string;
}

export default function SearchBar({
  placeholder,
  onSearch,
  initialQuery = '',
  initialCategory = '',
  className = ''
}: SearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<{ type: 'product' | 'supplier' | 'category'; label: string; sublabel?: string; value: string }[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const defaultPlaceholder = placeholder || t('home_search_placeholder');

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions when query changes
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const cleanQuery = query.toLowerCase().trim();
    const matches: typeof suggestions = [];

    // 1. Matches categories
    categories.forEach(cat => {
      if (cat.name.toLowerCase().includes(cleanQuery)) {
        matches.push({
          type: 'category',
          label: cat.name,
          sublabel: t('search_industry_cluster'),
          value: cat.id
        });
      }
    });

    // 2. Matches supplier names
    suppliers.forEach(sup => {
      if (sup.companyName.toLowerCase().includes(cleanQuery)) {
        matches.push({
          type: 'supplier',
          label: sup.companyName,
          sublabel: `${sup.location.city}, ${sup.location.state}`,
          value: sup.id
        });
      }
      
      // 3. Matches supplier products
      sup.products.forEach(prod => {
        if (prod.toLowerCase().includes(cleanQuery)) {
          matches.push({
            type: 'product',
            label: prod,
            sublabel: `${t('search_products_in')} ${sup.category}`,
            value: prod
          });
        }
      });
    });

    setSuggestions(matches.slice(0, 5));
  }, [query, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    onSearch(query, selectedCategory);
  };

  const handleSuggestionClick = (sug: typeof suggestions[0]) => {
    if (sug.type === 'category') {
      setSelectedCategory(sug.value);
      setQuery('');
      onSearch('', sug.value);
    } else if (sug.type === 'supplier') {
      onSearch(sug.label, selectedCategory);
    } else {
      setQuery(sug.label);
      onSearch(sug.label, selectedCategory);
    }
    setShowDropdown(false);
  };

  return (
    <div className={`relative w-full font-sans ${className}`} ref={dropdownRef}>
      <form
        onSubmit={handleSubmit}
        className={`flex flex-col md:flex-row bg-white rounded-xl border shadow-xs overflow-hidden transition-all h-max ${
          isFocused ? 'border-navy ring-1 ring-navy/15' : 'border-border-strong'
        }`}
      >
        {/* Category selector */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-cream-secondary md:bg-white text-text-primary text-xs font-semibold px-4 py-3 md:py-0 border-b md:border-b-0 md:border-r border-border-default md:w-48 focus:outline-none cursor-pointer"
        >
          <option value="">{t('search_all_categories')}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Input area */}
        <div className="flex-1 flex items-center px-3 relative">
          <Search size={18} className="text-text-muted flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              if (query.trim()) setShowDropdown(true);
            }}
            onBlur={() => {
              setIsFocused(false);
            }}
            placeholder={defaultPlaceholder}
            className="w-full text-xs text-text-primary placeholder-text-muted px-2.5 py-3 md:py-3.5 focus:outline-none bg-transparent"
          />
        </div>

        {/* Search Submit Button */}
        <button
          type="submit"
          className="bg-navy hover:bg-navy-light text-white text-xs font-bold px-8 py-3 md:py-0 transition-colors cursor-pointer select-none whitespace-nowrap"
        >
          {t('search_find_suppliers')}
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-border-strong rounded-xl shadow-lg z-50 overflow-hidden text-xs text-text-primary max-h-60 overflow-y-auto">
          {suggestions.map((sug, idx) => (
            <div
              key={idx}
              onClick={() => handleSuggestionClick(sug)}
              className="flex justify-between items-center px-4 py-3 border-b border-border-default/50 hover:bg-cream cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-primary">{sug.label}</span>
                {sug.sublabel && (
                  <span className="text-[10px] text-text-muted font-medium bg-cream-secondary px-1.5 py-0.5 rounded">
                    {sug.sublabel}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-gold uppercase tracking-wider">
                {sug.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
