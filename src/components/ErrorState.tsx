import { AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  actionLabel?: string;
  actionTo?: string;
}

export default function ErrorState({
  title = "Connection Error",
  message = "We encountered a temporary network issue syncing with the GIDC corridor ledger registry. Please try again.",
  onRetry,
  actionLabel,
  actionTo,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-trust-red/25 rounded-2xl bg-trust-red-bg/20 space-y-4 max-w-md mx-auto font-sans text-xs">
      <div className="w-12 h-12 rounded-full bg-trust-red-bg text-trust-red flex items-center justify-center border border-trust-red/20 shadow-2xs">
        <AlertTriangle size={24} />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">{title}</h3>
        <p className="text-xs text-text-secondary leading-relaxed px-4">{message}</p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center pt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 bg-navy hover:bg-navy-light text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer select-none"
          >
            <RefreshCw size={12} className="animate-spin-slow" />
            <span>Retry Sync</span>
          </button>
        )}
        {actionLabel && actionTo && (
          <Link
            href={actionTo}
            className="bg-cream border border-border-strong text-text-secondary font-bold py-2 px-4 rounded-lg text-xs transition-colors hover:bg-cream-secondary cursor-pointer select-none no-underline"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
