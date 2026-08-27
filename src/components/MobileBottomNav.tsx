'use client';

import React from 'react';

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface MobileBottomNavProps {
  items: NavItem[];
  activeItem: string;
  onItemChange: (key: any) => void;
}

export default function MobileBottomNav({ items, activeItem, onItemChange }: MobileBottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-default/80 flex items-center justify-around h-16 pb-safe px-2 shadow-[0_-4px_12px_rgba(15,31,53,0.05)]">
      {items.map(({ key, label, icon: Icon, badge }) => {
        const isActive = activeItem === key;
        return (
          <button
            key={key}
            onClick={() => onItemChange(key)}
            className="flex flex-col items-center justify-center flex-1 h-full min-w-[44px] cursor-pointer select-none transition-all relative"
            aria-label={label}
          >
            <div className={`p-1 rounded-lg transition-colors ${isActive ? 'text-gold' : 'text-text-secondary hover:text-navy'}`}>
              <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
            </div>
            <span className={`text-[10px] font-bold tracking-tight leading-none mt-0.5 ${isActive ? 'text-navy' : 'text-text-muted font-medium'}`}>
              {label}
            </span>
            
            {/* Notification Badge */}
            {badge !== undefined && badge > 0 && (
              <span className="absolute top-2 right-1/2 translate-x-4 bg-trust-red text-white text-[10px] rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5 font-bold border border-white">
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
