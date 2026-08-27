'use client';

import { useState, useEffect } from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'rfq' | 'quote' | 'verification' | 'system';
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New RFQ Match Available',
    message: 'A verified buyer from Germany submitted an RFQ matching your GIDC chemical cluster.',
    timestamp: '5m ago',
    read: false,
    type: 'rfq',
  },
  {
    id: 'notif-2',
    title: 'Audit Report Updated',
    message: 'Your geotagged physical audit report has been verified by Artha Compliance Desk.',
    timestamp: '1h ago',
    read: false,
    type: 'verification',
  },
  {
    id: 'notif-3',
    title: 'Quote Accepted',
    message: 'Mehta Traders accepted your side-by-side quote for WHO grade Ibuprofen.',
    timestamp: '3h ago',
    read: true,
    type: 'quote',
  },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  useEffect(() => {
    // Simulate background periodic notification polling
    const interval = setInterval(() => {
      const randomTrigger = Math.random();
      if (randomTrigger > 0.7) {
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          title: 'Live Trade Activity',
          message: 'New corridor enquiry matched your verified factory profile.',
          timestamp: 'Just now',
          read: false,
          type: 'system',
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    }, 45000); // Check every 45 seconds

    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, markAllAsRead, markAsRead };
}
