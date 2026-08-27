import React from 'react';

type StatusType = 'active' | 'verified' | 'passed' | 'pending' | 'in_review' | 'warning' | 'expiring' | 'expired' | 'failed' | 'blocked' | 'inactive' | 'insufficient';

interface StatusLabelProps {
  status: StatusType;
  customText?: string;
  className?: string;
}

export default function StatusLabel({ status, customText, className = '' }: StatusLabelProps) {
  const statusConfig = {
    active: { bg: 'bg-trust-green-bg', text: 'text-trust-green', border: 'border-trust-green/20', label: 'Active', icon: '●' },
    verified: { bg: 'bg-trust-green-bg', text: 'text-trust-green', border: 'border-trust-green/20', label: 'Verified', icon: '✓' },
    passed: { bg: 'bg-trust-green-bg', text: 'text-trust-green', border: 'border-trust-green/20', label: 'Passed', icon: '✓' },
    
    pending: { bg: 'bg-trust-blue-bg', text: 'text-trust-blue', border: 'border-trust-blue/20', label: 'Pending', icon: '○' },
    in_review: { bg: 'bg-trust-blue-bg', text: 'text-trust-blue', border: 'border-trust-blue/20', label: 'In Review', icon: '○' },
    
    warning: { bg: 'bg-trust-amber-bg', text: 'text-trust-amber', border: 'border-trust-amber/20', label: 'Warning', icon: '⚠' },
    expiring: { bg: 'bg-trust-amber-bg', text: 'text-trust-amber', border: 'border-trust-amber/20', label: 'Expiring', icon: '⚠' },
    
    expired: { bg: 'bg-trust-red-bg', text: 'text-trust-red', border: 'border-trust-red/20', label: 'Expired', icon: '✕' },
    failed: { bg: 'bg-trust-red-bg', text: 'text-trust-red', border: 'border-trust-red/20', label: 'Failed', icon: '✕' },
    blocked: { bg: 'bg-trust-red-bg', text: 'text-trust-red', border: 'border-trust-red/20', label: 'Blocked', icon: '✕' },
    
    inactive: { bg: 'bg-cream-secondary', text: 'text-text-muted', border: 'border-text-muted/10', label: 'Inactive', icon: '—' },
    insufficient: { bg: 'bg-cream-secondary', text: 'text-text-muted', border: 'border-text-muted/10', label: 'Insufficient Data', icon: '—' },
  };

  const config = statusConfig[status] || statusConfig.inactive;
  const labelText = customText || config.label;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] md:text-xs font-medium select-none ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className="text-[10px] leading-none">{config.icon}</span>
      <span className="tracking-wide uppercase font-bold text-[10px]">{labelText}</span>
    </div>
  );
}
