import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function SkeletonPulse({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-cream-secondary rounded ${className}`}></div>
  );
}

export function SupplierCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'list' }) {
  if (variant === 'list') {
    return (
      <div className="border border-border-default rounded-xl p-4 bg-white flex flex-col md:flex-row gap-4 items-start md:items-center justify-between w-full">
        <div className="flex gap-4 items-center w-full md:w-auto">
          {/* Avatar thumb */}
          <SkeletonPulse className="w-16 h-16 rounded-xl flex-shrink-0" />
          
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <SkeletonPulse className="h-4 w-40" />
              <SkeletonPulse className="h-4 w-20 rounded-full" />
            </div>
            <div className="flex gap-3">
              <SkeletonPulse className="h-3.5 w-24" />
              <SkeletonPulse className="h-3.5 w-16" />
              <SkeletonPulse className="h-3.5 w-20" />
            </div>
            <div className="flex gap-1.5">
              <SkeletonPulse className="h-4 w-12 rounded" />
              <SkeletonPulse className="h-4 w-12 rounded" />
              <SkeletonPulse className="h-4 w-12 rounded" />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-border-default/50">
          <SkeletonPulse className="h-8 w-full md:w-36" />
          <div className="flex gap-2">
            <SkeletonPulse className="h-8 w-20 rounded-lg" />
            <SkeletonPulse className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div className="border border-border-default rounded-xl bg-white flex flex-col h-full overflow-hidden w-full">
      {/* Head image box */}
      <SkeletonPulse className="h-44 rounded-none w-full" />
      
      {/* Body details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <SkeletonPulse className="h-4 w-3/4" />
            <SkeletonPulse className="h-3 w-1/2" />
          </div>
          <SkeletonPulse className="h-8 w-full" />
          <div className="flex gap-1.5">
            <SkeletonPulse className="h-4.5 w-12 rounded" />
            <SkeletonPulse className="h-4.5 w-12 rounded" />
            <SkeletonPulse className="h-4.5 w-12 rounded" />
          </div>
          <div className="space-y-1">
            <SkeletonPulse className="h-3 w-full" />
            <SkeletonPulse className="h-3 w-5/6" />
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-border-default/50">
          <div className="grid grid-cols-2 gap-2">
            <SkeletonPulse className="h-8 w-full" />
            <SkeletonPulse className="h-8 w-full" />
          </div>
          <SkeletonPulse className="h-3 w-2/3" />
          <div className="flex gap-2">
            <SkeletonPulse className="h-8 flex-1 rounded-lg" />
            <SkeletonPulse className="h-8 flex-1 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 4, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="border border-border-default rounded-xl overflow-hidden bg-white w-full">
      <div className="bg-cream-secondary p-3 border-b border-border-default flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonPulse key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border-default/50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonPulse key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardWidgetSkeleton() {
  return (
    <div className="border border-border-default rounded-xl p-4 bg-white space-y-4 w-full">
      <div className="flex justify-between items-center pb-2 border-b border-border-default/50">
        <SkeletonPulse className="h-4.5 w-24" />
        <SkeletonPulse className="h-4 w-12 rounded" />
      </div>
      <div className="space-y-3">
        <div className="flex gap-3">
          <SkeletonPulse className="h-10 w-10 rounded-lg flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <SkeletonPulse className="h-3.5 w-1/2" />
            <SkeletonPulse className="h-3 w-5/6" />
          </div>
        </div>
        <div className="flex gap-3">
          <SkeletonPulse className="h-10 w-10 rounded-lg flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <SkeletonPulse className="h-3.5 w-1/3" />
            <SkeletonPulse className="h-3 w-2/3" />
          </div>
        </div>
        <div className="flex gap-3">
          <SkeletonPulse className="h-10 w-10 rounded-lg flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <SkeletonPulse className="h-3.5 w-1/4" />
            <SkeletonPulse className="h-3 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
