'use client';

import { useState, useEffect } from 'react';

export interface SessionUser {
  authenticated: boolean;
  role?: 'buyer' | 'supplier' | 'admin';
  userId?: string;
  supplierId?: string;
  supplierSlug?: string;
  email?: string;
  companyName?: string;
}

interface UseSessionResult {
  user: SessionUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

let cachedUser: SessionUser | null = null;
let activeSessionPromise: Promise<SessionUser> | null = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory TTL

async function fetchSessionDeduplicated(): Promise<SessionUser> {
  const now = Date.now();
  if (cachedUser && (now - lastFetchedAt) < CACHE_TTL_MS) {
    return cachedUser;
  }
  if (activeSessionPromise) {
    return activeSessionPromise;
  }

  activeSessionPromise = fetch('/api/auth/me', { credentials: 'same-origin' })
    .then(res => {
      if (!res.ok) {
        if (res.status === 401 && typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          const isProtectedRoute =
            pathname.startsWith('/dashboard') ||
            pathname.startsWith('/supplier-dashboard') ||
            pathname.startsWith('/admin') ||
            pathname.startsWith('/checkout');

          if (isProtectedRoute) {
            window.location.href = `/signin?redirect=${encodeURIComponent(pathname)}&error=session_expired`;
          }
        }
        return { authenticated: false };
      }
      return res.json();
    })
    .then((data: SessionUser) => {
      cachedUser = data;
      lastFetchedAt = Date.now();
      return data;
    })
    .catch(() => {
      const fallback = { authenticated: false };
      cachedUser = fallback;
      return fallback;
    })
    .finally(() => {
      activeSessionPromise = null;
    });

  return activeSessionPromise;
}

export function useSession(): UseSessionResult {
  const [user, setUser] = useState<SessionUser | null>(cachedUser);
  const [loading, setLoading] = useState(cachedUser === null);

  const checkSession = () => {
    fetchSessionDeduplicated().then(data => {
      setUser(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    checkSession();
    const interval = setInterval(() => {
      lastFetchedAt = 0; // force fresh check
      checkSession();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
    setUser({ authenticated: false });
    window.location.href = '/';
  };

  return { user, loading, logout };
}

export function getDashboardPath(role?: string): string {
  if (role === 'admin') return '/admin';
  if (role === 'supplier') return '/supplier-dashboard';
  return '/dashboard';
}

export function getDashboardLabel(user: SessionUser | null): string {
  if (!user || !user.authenticated) return 'Sign In';
  if (user.role === 'admin') return 'Admin Panel';
  if (user.companyName) return user.companyName;
  if (user.role === 'supplier') return 'Supplier Desk';
  return 'Buyer Desk';
}

