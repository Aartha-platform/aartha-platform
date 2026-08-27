'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';
import { useSession } from '@/hooks/useSession';

export default function QuickDashboardReturn() {
  const pathname = usePathname();
  const { user, loading } = useSession();
  const isAuthenticated = !loading && user?.authenticated;

  const isAdmin = user?.role === 'admin' || pathname?.startsWith('/admin');
  const isSupplier = user?.role === 'supplier' || pathname?.startsWith('/supplier-dashboard');

  const dashboardPath = isAdmin ? '/admin' : isSupplier ? '/supplier-dashboard' : '/dashboard';
  const label = isAdmin ? 'Admin Panel' : isSupplier ? 'Supplier Desk' : 'Buyer Desk';

  // Do not show on dashboard page itself or if user is not logged in
  if (!isAuthenticated || pathname === '/dashboard' || pathname === '/supplier-dashboard' || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-5 z-40">
      <Link
        href={dashboardPath}
        className="bg-navy hover:bg-navy-light text-white border border-gold/30 hover:border-gold px-3.5 py-2.5 rounded-2xl shadow-premium flex items-center gap-2.5 text-xs font-bold transition-all duration-300 hover:scale-105 select-none no-underline group"
      >
        <div className="w-6 h-6 rounded-lg bg-gold/20 flex items-center justify-center text-gold group-hover:rotate-12 transition-transform">
          <LayoutDashboard size={14} />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-gold font-extrabold uppercase tracking-widest leading-none">{label}</span>
          <span className="text-white font-black text-xs leading-tight flex items-center gap-1 mt-0.5">
            Return to Dashboard <ArrowLeft size={10} className="rotate-180 text-gold" />
          </span>
        </div>
      </Link>
    </div>
  );
}
