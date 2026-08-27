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

export function useSession(): UseSessionResult {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = () => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            // If on a protected route, auto-redirect to signin on session loss
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
        setUser(data);
      })
      .catch(() => {
        setUser({ authenticated: false });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    checkSession();

    // Check session every 5 minutes in background
    const interval = setInterval(checkSession, 5 * 60 * 1000);
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

