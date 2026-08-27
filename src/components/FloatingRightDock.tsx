"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, FileText, HelpCircle, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';

const WhatsAppIcon = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.588 2.019 14.122.996 11.99.996c-5.441 0-9.87 4.373-9.874 9.8.001 1.637.45 3.238 1.3 4.675L2.4 21.082l6.247-1.628zm10.742-5.467c-.29-.145-1.716-.848-1.98-.943-.266-.096-.46-.145-.654.145-.193.291-.749.943-.918 1.137-.17.195-.34.219-.63.075-1.02-.511-1.689-.863-2.316-1.942-.257-.442.257-.41.737-1.37.08-.163.04-.305-.02-.45-.06-.145-.654-1.577-.897-2.16-.236-.57-.497-.491-.68-.501-.17-.008-.364-.01-.557-.01-.193 0-.509.072-.776.364-.266.291-1.02 1.002-1.02 2.443 0 1.441 1.05 2.83 1.196 3.024.145.195 2.062 3.149 5 4.36.7.288 1.246.46 1.673.596.702.222 1.342.19 1.847.114.563-.084 1.716-.701 1.96-1.378.243-.678.243-1.26.17-.137-.073-.122-.29-.267-.58-.412z" />
  </svg>
);

export default function FloatingRightDock() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dockItems = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: WhatsAppIcon,
      iconColor: 'text-emerald-500',
      badge: 'Live',
      badgeClass: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      hasDot: true,
      dotColor: 'bg-emerald-500',
      action: () => {
        window.open('https://wa.me/917208432138?text=Hello%20Artha%2C%20I%20need%20sourcing%20support.', '_blank');
      }
    },
    {
      id: 'ai',
      label: 'Ask AI',
      icon: Sparkles,
      iconColor: 'text-amber-500',
      badge: 'v2.4',
      badgeClass: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
      hasGlow: true,
      action: () => {
        window.dispatchEvent(new CustomEvent('artha-toggle-ai-assistant'));
      }
    },
    {
      id: 'rfq',
      label: 'Post RFQ',
      icon: FileText,
      iconColor: 'text-blue-500',
      href: '/rfq'
    },
    {
      id: 'help',
      label: 'Feedback',
      icon: HelpCircle,
      iconColor: 'text-amber-500 dark:text-amber-400',
      href: '/feedback',
      hasDot: true,
      dotColor: 'bg-amber-500',
      badge: 'New',
      badgeClass: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
    },
  ];

  const isExpanded = isHovered || isClicked;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsClicked(false);
      }}
      className={`fixed right-0 top-[64%] -translate-y-1/2 z-[70] hidden md:flex flex-col select-none transition-[width] duration-300 ease-out will-change-[width] ${
        isExpanded ? 'w-[146px]' : 'w-[46px]'
      }`}
    >
      <div className="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md shadow-[0_8px_28px_rgba(0,0,0,0.16)] border-l border-t border-b border-gold/30 dark:border-white/10 rounded-l-2xl p-1.5 flex flex-col gap-1 w-full overflow-hidden transition-all duration-300 hover:border-gold/60">
        
        {/* Toggle Arrow Handle */}
        <div 
          onClick={() => setIsClicked(!isClicked)}
          className="flex items-center justify-between px-1.5 h-6 cursor-pointer text-slate-400 hover:text-navy dark:hover:text-white border-b border-slate-200/60 dark:border-white/10 pb-1 transition-colors group"
        >
          <span className={`text-[8.5px] font-black uppercase tracking-widest text-gold transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            DOCK
          </span>
          <div className="p-0.5 rounded hover:bg-gold/10 transition-colors">
            {isExpanded ? (
              <ChevronRight size={13} className="text-gold transition-transform group-hover:translate-x-0.5" />
            ) : (
              <ChevronLeft size={13} className="text-gold transition-transform group-hover:-translate-x-0.5" />
            )}
          </div>
        </div>

        {/* Dock Items */}
        {dockItems.map((item) => {
          const Icon = item.icon;

          const buttonContent = (
            <div
              onClick={item.action}
              className="flex items-center w-full h-9 px-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-150 cursor-pointer group relative overflow-hidden border border-transparent hover:border-gold/20"
            >
              <div className="relative flex items-center justify-center flex-shrink-0">
                <Icon size={16} className={`${item.iconColor} group-hover:scale-110 transition-transform duration-150`} />
                {item.hasDot && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${item.dotColor === 'bg-amber-500' ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${item.dotColor || 'bg-emerald-500'}`}></span>
                  </span>
                )}
              </div>
              
              <div className={`ml-2.5 flex items-center justify-between flex-1 transition-[opacity,transform] duration-250 ease-out will-change-[opacity,transform] whitespace-nowrap ${
                isExpanded ? 'opacity-100 translate-x-0 visible' : 'opacity-0 translate-x-2 invisible'
              }`}>
                <span className="text-[10px] font-bold tracking-tight">
                  {item.label}
                </span>
                {item.badge && (
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full border ${item.badgeClass}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          );

          return item.href ? (
            <Link key={item.id} href={item.href} prefetch={false} className="no-underline">
              {buttonContent}
            </Link>
          ) : (
            <div key={item.id}>{buttonContent}</div>
          );
        })}

        {/* Back to top button */}
        {showBackToTop && (
          <div className="pt-1 border-t border-slate-200/60 dark:border-white/10">
            <button
              onClick={scrollToTop}
              className="flex items-center w-full h-8 px-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-gold/10 hover:text-gold transition-all duration-150 cursor-pointer group overflow-hidden border border-transparent hover:border-gold/20"
            >
              <ArrowUp size={14} className="flex-shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5 text-gold" />
              
              <span className={`text-[9px] font-bold uppercase tracking-wider ml-2.5 transition-[opacity,transform] duration-250 ease-out will-change-[opacity,transform] whitespace-nowrap ${
                isExpanded ? 'opacity-100 translate-x-0 visible' : 'opacity-0 translate-x-2 invisible'
              }`}>
                Top
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
