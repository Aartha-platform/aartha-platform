'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const defaultId = React.useId();
    const checkboxId = id || defaultId;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={checkboxId}
          className="relative flex items-start gap-3 cursor-pointer select-none group font-sans text-xs text-text-secondary dark:text-slate-300"
        >
          <div className="relative flex items-center mt-0.5">
            <input
              type="checkbox"
              id={checkboxId}
              ref={ref}
              className="peer sr-only"
              {...props}
            />
            {/* Custom Checkbox Design */}
            <div
              className={cn(
                "h-4 w-4 rounded-md border border-slate-300 dark:border-white/20 bg-white dark:bg-navy-dark flex items-center justify-center",
                "transition-all duration-200 ease-out",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-gold peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-navy",
                "peer-checked:bg-amber-600 peer-checked:border-amber-500 peer-checked:text-white",
                "group-hover:border-amber-500/70 dark:group-hover:border-amber-400/70",
                "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:group-hover:border-slate-300 dark:peer-disabled:group-hover:border-white/20",
                className
              )}
            >
              <Check
                className={cn(
                  "h-3 w-3 stroke-[3] text-white opacity-0 scale-75 transition-all duration-200 ease-out",
                  "peer-checked:opacity-100 peer-checked:scale-100"
                )}
              />
            </div>
            {/* CSS style injection to map peer check state directly to checking checkmark styling */}
            <style jsx global>{`
              .peer:checked ~ div svg {
                opacity: 1 !important;
                transform: scale(1) !important;
              }
            `}</style>
          </div>
          
          {/* Label & Description text */}
          {(label || description) && (
            <div className="flex flex-col select-none cursor-pointer">
              {label && (
                <span className="font-semibold text-text-primary dark:text-white text-xs group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {label}
                </span>
              )}
              {description && (
                <span className="text-[10px] text-text-muted dark:text-slate-400 leading-normal">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
        {error && (
          <span className="text-[10px] text-trust-red dark:text-red-400 font-medium pl-7">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
