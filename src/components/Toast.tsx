'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-xl shadow-premium-lg border backdrop-blur-xl pointer-events-auto flex items-start gap-3 transition-all duration-300 animate-fadeIn ${
              t.type === 'success'
                ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : t.type === 'warning'
                ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/30 text-amber-700 dark:text-amber-300'
                : t.type === 'info'
                ? 'bg-sky-500/10 dark:bg-sky-950/40 border-sky-500/30 text-sky-700 dark:text-sky-300'
                : 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/30 text-rose-700 dark:text-rose-300'
            }`}
          >
            {t.type === 'success' && <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info size={18} className="text-sky-500 flex-shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />}
            
            <div className="flex-1 text-xs font-bold leading-relaxed text-text-primary dark:text-white">
              {t.message}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-text-muted hover:text-text-primary dark:hover:text-white cursor-pointer transition-colors p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
