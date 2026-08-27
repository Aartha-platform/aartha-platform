'use client';

export function getCsrfToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(^|;)\s*_csrf\s*=\s*([^;]+)/);
  return match ? decodeURIComponent(match[2]) : '';
}
