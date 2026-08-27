import Link from 'next/link';
import { BarChart2, Bookmark, Users, FileText, GitCompare, MessageSquare, Clock, Bell, TrendingUp, RefreshCw, Settings, Zap, Sparkles } from 'lucide-react';
import { BuyerSection } from '../types';

interface SidebarNavProps {
  activeSection: BuyerSection;
  onSectionChange: (section: BuyerSection) => void;
  unreadMessages: number;
  isPro: boolean;
  onUpgradeClick: () => void;
}

const menuGroups = [
  {
    title: 'Sourcing Center',
    items: [
      { section: 'overview' as BuyerSection, label: 'Overview', icon: BarChart2 },
      { section: 'rfq-status' as BuyerSection, label: 'RFQ Status', icon: FileText },
      { section: 'quote-comparisons' as BuyerSection, label: 'Compare Quotes', icon: GitCompare },
      { section: 'shortlisted-suppliers' as BuyerSection, label: 'My Suppliers', icon: Users },
    ]
  },
  {
    title: 'Communications',
    items: [
      { section: 'messages' as BuyerSection, label: 'Messages', icon: MessageSquare },
      { section: 'order-history' as BuyerSection, label: 'Orders', icon: Clock },
      { section: 'repeat-orders' as BuyerSection, label: 'Reorders', icon: RefreshCw },
    ]
  },
  {
    title: 'Market Intel',
    items: [
      { section: 'saved-searches' as BuyerSection, label: 'My Searches', icon: Bookmark },
      { section: 'price-alerts' as BuyerSection, label: 'Price Alerts', icon: Bell },
      { section: 'market-insights' as BuyerSection, label: 'Market Intel', icon: TrendingUp },
    ]
  },
  {
    title: 'Workspace',
    items: [
      { section: 'settings' as BuyerSection, label: 'Settings', icon: Settings },
    ]
  }
];

export default function SidebarNav({ activeSection, onSectionChange, unreadMessages, isPro, onUpgradeClick }: SidebarNavProps) {
  return (
    <aside className="hidden md:flex flex-col w-52 flex-shrink-0 bg-white dark:bg-[var(--surface)] border-r border-border-default dark:border-white/10 select-none">
      <nav className="py-3.5 flex flex-col gap-3.5">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-4 text-[9px] font-black uppercase tracking-widest text-gold/90 flex items-center gap-1.5">
              <span>{group.title}</span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-gold/30 to-transparent"></div>
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map(({ section, label, icon: Icon }) => (
                <button
                  key={section}
                  onClick={() => onSectionChange(section)}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-xs font-bold transition-all duration-200 text-left cursor-pointer select-none border-l-[3px] group ${
                    activeSection === section
                      ? 'bg-cream-secondary/80 dark:bg-slate-800/80 text-navy dark:text-white border-gold shadow-2xs'
                      : 'text-text-secondary dark:text-slate-300 hover:bg-cream-secondary/40 dark:hover:bg-slate-800/40 hover:text-navy dark:hover:text-white border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={`transition-transform duration-200 group-hover:scale-110 ${activeSection === section ? 'text-gold' : 'text-text-muted dark:text-slate-400'}`} />
                    <span className="tracking-tight">{label}</span>
                  </div>
                  {section === 'messages' && unreadMessages > 0 && (
                    <span className="bg-trust-red text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold shadow-2xs animate-pulse">
                      {unreadMessages}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
        
        {/* Ask AI Assistant Route Link */}
        <div className="border-t border-border-default/50 dark:border-white/10 pt-2.5 px-3">
          <Link
            href="/ai-assistant"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gold hover:bg-gold/10 transition-all text-left no-underline select-none rounded-xl border border-gold/20 hover:border-gold/40 shadow-3xs"
          >
            <Sparkles size={15} className="text-gold animate-spin-slow" />
            <span>AI Sourcing Assistant</span>
          </Link>
        </div>

        {/* Upgrade Workspace Glass Card */}
        <div className="mx-3 mt-1 bg-gradient-to-br from-navy via-navy-light to-navy-dark rounded-2xl p-3.5 text-white border border-gold/25 relative overflow-hidden shadow-premium group hover:border-gold/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/15 rounded-full filter blur-2xl pointer-events-none group-hover:bg-gold/25 transition-all"></div>
          {isPro ? (
            <>
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-gold animate-pulse" />
                  <span className="text-[10px] font-black text-gold uppercase tracking-wider">Verified Buyer Pro</span>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/30">ACTIVE</span>
              </div>
              <p className="text-[10px] text-slate-300 mb-3 leading-relaxed font-semibold relative z-10">Your Pro account is fully active. Direct GIDC matching & premium price index unlocked.</p>
              <button 
                onClick={() => onSectionChange('settings')}
                className="w-full bg-navy/80 hover:bg-navy border border-gold/40 hover:border-gold text-gold text-[10px] font-extrabold py-2 rounded-xl transition-all cursor-pointer select-none relative z-10 shadow-2xs uppercase tracking-wider hover:scale-[1.02]"
              >
                Manage Subscription
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-gold" />
                  <span className="text-[10px] font-black text-gold uppercase tracking-wider">Verified Buyer Pro</span>
                </div>
                <span className="bg-gold/20 text-gold text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-gold/30">UPGRADE</span>
              </div>
              <p className="text-[10px] text-slate-300 mb-3 leading-relaxed font-semibold relative z-10">Unlock premium factory dossiers, priority RFQ routing, and direct API access.</p>
              <button 
                onClick={onUpgradeClick}
                className="w-full bg-gradient-to-r from-gold via-amber-500 to-gold-hover hover:from-gold-hover hover:to-gold text-white text-[10px] font-black py-2 rounded-xl transition-all cursor-pointer select-none relative z-10 shadow-md uppercase tracking-wider hover:scale-[1.02] flex items-center justify-center gap-1.5"
              >
                <Zap size={12} className="fill-current" />
                <span>Upgrade Workspace</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </aside>
  );
}
