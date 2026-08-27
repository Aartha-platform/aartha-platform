import { ReactNode } from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  illustrationType?: 'search' | 'dashboard' | 'message' | 'reviews';
  primaryActionLabel?: string;
  primaryActionTo?: string;
  primaryActionOnClick?: () => void;
  secondaryActionLabel?: string;
  secondaryActionTo?: string;
  secondaryActionOnClick?: () => void;
}

export default function EmptyState({
  title,
  description,
  illustrationType = 'search',
  primaryActionLabel,
  primaryActionTo,
  primaryActionOnClick,
  secondaryActionLabel,
  secondaryActionTo,
  secondaryActionOnClick
}: EmptyStateProps) {

  // Simple clean SVG line illustrations (max 120px)
  const illustrations = {
    search: (
      <svg className="w-24 h-24 text-text-muted/40 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9" />
      </svg>
    ),
    dashboard: (
      <svg className="w-24 h-24 text-text-muted/40 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    message: (
      <svg className="w-24 h-24 text-text-muted/40 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    reviews: (
      <svg className="w-24 h-24 text-text-muted/40 mx-auto" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.173-.439.81-.439.98 0l1.9 3.848 4.25.617c.477.069.668.66.326.992l-3.076 3.003.727 4.233c.082.476-.418.84-.855.616l-3.8-2.001-3.8 2.001c-.437.224-.937-.14-.855-.616l.727-4.233L3.58 8.956c-.344-.332-.153-.923.326-.992l4.25-.617 1.9-3.848z" />
      </svg>
    ),
  };

  const renderAction = (
    label?: string,
    to?: string,
    onClick?: () => void,
    isPrimary: boolean = true
  ) => {
    if (!label) return null;

    const baseClass = isPrimary
      ? 'bg-navy hover:bg-navy-light text-white font-bold py-2.5 px-6 rounded-lg text-xs transition-colors cursor-pointer select-none no-underline'
      : 'bg-cream border border-border-strong text-text-secondary font-bold py-2.5 px-6 rounded-lg text-xs transition-colors hover:bg-cream-secondary cursor-pointer select-none no-underline';

    if (to) {
      return (
        <Link href={to} className={baseClass}>
          {label}
        </Link>
      );
    }

    return (
      <button onClick={onClick} className={baseClass}>
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-border-default rounded-xl bg-white space-y-4 max-w-md mx-auto font-sans">
      <div className="flex justify-center w-full">
        {illustrations[illustrationType] || illustrations.search}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">{title}</h3>
        <p className="text-xs text-text-secondary leading-relaxed px-4">{description}</p>
      </div>

      {(primaryActionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          {renderAction(secondaryActionLabel, secondaryActionTo, secondaryActionOnClick, false)}
          {renderAction(primaryActionLabel, primaryActionTo, primaryActionOnClick, true)}
        </div>
      )}
    </div>
  );
}
