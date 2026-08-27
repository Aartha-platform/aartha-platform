"use client";

import { useState, useEffect } from 'react';
import { Bell, Clock, Info, CheckCircle, AlertTriangle, TrendingUp, X } from 'lucide-react';

export interface AlertItem {
  id: string;
  type: 'match' | 'quote' | 'status' | 'market';
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
  link?: string;
}

const initialAlerts: AlertItem[] = [
  {
    id: 'a1',
    type: 'match',
    title: 'New Corridor Match',
    description: 'Anand Pharma Solutions matched your WHO-GMP Paracetamol API RFQ with score 96/100.',
    timestamp: '2 hours ago',
    unread: true,
  },
  {
    id: 'a2',
    type: 'quote',
    title: 'Quote Price Update',
    description: 'Vadodara Chemicals Ltd. submitted a revised quote of $3.20/kg for Paracetamol API.',
    timestamp: '5 hours ago',
    unread: true,
  },
  {
    id: 'a3',
    type: 'market',
    title: 'Market Shift Detected',
    description: 'Paracetamol API benchmark fell 3.5% this week in Gujarat industrial desks.',
    timestamp: '1 day ago',
    unread: false,
  },
  {
    id: 'a4',
    type: 'status',
    title: 'RFQ Progressed',
    description: 'CNC Precision Lathe Machine Bits RFQ (RFQ-2026-05-0019) has been marked Closed.',
    timestamp: '1 week ago',
    unread: false,
  },
];

interface AlertCenterProps {
  onRerunSearch?: (term: string) => void;
}

export default function AlertCenter({ onRerunSearch }: AlertCenterProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadAlerts = () => {
      const stored = localStorage.getItem('artha_buyer_notifications');
      if (stored) {
        setAlerts(JSON.parse(stored));
      } else {
        setAlerts(initialAlerts);
        localStorage.setItem('artha_buyer_notifications', JSON.stringify(initialAlerts));
      }
    };

    loadAlerts();

    window.addEventListener('artha_refresh_notifications', loadAlerts);

    const handleMessageAlert = (e: any) => {
      const { supplierName, text } = e.detail;
      const stored = localStorage.getItem('artha_buyer_notifications');
      const current = stored ? JSON.parse(stored) : [];
      const newAlert: AlertItem = {
        id: `a-${Date.now()}`,
        type: 'quote',
        title: `Message from ${supplierName}`,
        description: text.length > 80 ? text.slice(0, 77) + '...' : text,
        timestamp: 'Just now',
        unread: true
      };
      const updated = [newAlert, ...current].slice(0, 20); // Keep max 20 alerts
      localStorage.setItem('artha_buyer_notifications', JSON.stringify(updated));
      setAlerts(updated);
    };

    window.addEventListener('artha_new_message_alert', handleMessageAlert);

    return () => {
      window.removeEventListener('artha_refresh_notifications', loadAlerts);
      window.removeEventListener('artha_new_message_alert', handleMessageAlert);
    };
  }, []);

  const saveAlerts = (newAlerts: AlertItem[]) => {
    setAlerts(newAlerts);
    localStorage.setItem('artha_buyer_notifications', JSON.stringify(newAlerts));
  };

  const markAllRead = () => {
    const updated = alerts.map(a => ({ ...a, unread: false }));
    saveAlerts(updated);
  };

  const deleteAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    saveAlerts(updated);
  };

  const unreadCount = alerts.filter(a => a.unread).length;

  return (
    <div className="relative font-sans select-none z-30">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-secondary hover:text-navy hover:bg-cream-secondary rounded-lg transition-colors cursor-pointer"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-trust-red text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-border-default rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in text-xs">
            {/* Header */}
            <div className="p-3 bg-cream-secondary border-b border-border-default flex items-center justify-between">
              <span className="font-bold text-navy uppercase tracking-wider text-[10px]">Alert Center</span>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-gold font-bold hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="divide-y divide-border-default/50 max-h-72 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-6 text-center text-text-muted font-semibold">
                  No alerts at this time.
                </div>
              ) : (
                alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-3 relative flex gap-3 hover:bg-cream/10 transition-colors ${
                      alert.unread ? 'bg-trust-blue-bg/20' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {alert.type === 'match' && <CheckCircle size={14} className="text-trust-green" />}
                      {alert.type === 'quote' && <Info size={14} className="text-trust-blue" />}
                      {alert.type === 'market' && <TrendingUp size={14} className="text-gold" />}
                      {alert.type === 'status' && <AlertTriangle size={14} className="text-trust-amber" />}
                    </div>

                    <div className="flex-1 space-y-0.5 pr-4 min-w-0">
                      <div className="font-bold text-text-primary flex items-center gap-1.5 leading-snug">
                        <span className="truncate block">{alert.title}</span>
                        {alert.unread && <span className="w-1.5 h-1.5 bg-trust-blue rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] text-text-secondary leading-normal">{alert.description}</p>
                      <span className="text-[9px] text-text-muted font-medium block pt-1">{alert.timestamp}</span>
                    </div>

                    <button 
                      onClick={() => deleteAlert(alert.id)}
                      className="absolute top-2 right-2 text-text-muted hover:text-text-primary cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2 bg-cream/25 text-[10px] text-text-muted text-center border-t border-border-default/50 font-medium">
              Geotagged corridor logs active · Aartha Trust
            </div>
          </div>
        </>
      )}
    </div>
  );
}
