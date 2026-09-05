'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, KeyRound, AlertTriangle, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { isBusinessEmail } from '@/lib/validation';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your registered corporate email.');
      return;
    }

    if (!isBusinessEmail(email)) {
      setError('Free email domains are restricted. Please enter your corporate business email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send reset code. Please try again.');
        return;
      }
      setStep(2);
      setCountdown(120);
      setSuccess(data.message || 'Verification code sent to your business email.');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code || code.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 15) {
      setError('New password must be at least 15 characters long (NIST standard passphrase).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Password reset failed. Please check your verification code.');
        return;
      }
      setSuccess('Password reset successful! Redirecting to sign in page...');
      setTimeout(() => {
        router.push('/signin');
      }, 2000);
    } catch {
      setError('Network error during password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans flex flex-col justify-between text-text-primary">
      <div className="max-w-md mx-auto w-full px-4 py-12 md:py-20 flex items-center justify-center flex-1">
        <div className="bg-white dark:bg-[var(--surface)] border border-slate-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-premium-lg w-full p-6 md:p-8 space-y-6">
          
          {/* Header */}
          <div className="space-y-3 text-center flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
              <img src="/brand/aartha-logo.png" alt="Aartha Logo" className="w-full h-full object-contain block dark:hidden drop-shadow-xs" />
              <img src="/brand/aartha-logo-white.png" alt="Aartha Logo" className="w-full h-full object-contain hidden dark:block drop-shadow-xs" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase text-navy dark:text-white tracking-tight">
                {step === 1 ? 'Reset Password' : 'Enter Verification Code'}
              </h1>
              <p className="text-[11px] text-text-muted font-medium mt-1">
                {step === 1
                  ? 'Enter your corporate email address to receive a secure password reset code.'
                  : `Enter the 6-digit code sent to ${email} and your new password.`
                }
              </p>
            </div>
          </div>

          {/* Feedback banners */}
          {error && (
            <div className="bg-red-50 text-red-700 text-xs font-bold p-3.5 rounded-xl border border-red-100 flex items-start gap-2">
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3.5 rounded-xl border border-emerald-100 flex items-start gap-2">
              <Check size={15} className="flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary">
                  Business Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-navy/20 focus:bg-white transition-all"
                  />
                  <Mail className="absolute left-3 top-3 text-text-muted" size={14} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-navy text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-navy-light transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Sending Code...' : 'Send Reset Code'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-widest text-text-primary focus:outline-none focus:ring-2 focus:ring-navy/20 focus:bg-white transition-all"
                  />
                  <KeyRound className="absolute left-3 top-3 text-text-muted" size={14} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary">
                  New Password (Min 15 chars)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-navy/20 focus:bg-white transition-all"
                  />
                  <Lock className="absolute left-3 top-3 text-text-muted" size={14} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-primary">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-navy/20 focus:bg-white transition-all"
                  />
                  <Lock className="absolute left-3 top-3 text-text-muted" size={14} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-navy text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-navy-light transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Resetting Password...' : 'Update Password'}</span>
                <Check size={14} />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[11px] text-text-muted hover:text-navy font-semibold underline cursor-pointer"
                >
                  Resend code or change email
                </button>
              </div>
            </form>
          )}

          {/* Footer link back to signin */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <Link
              href="/signin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:underline"
            >
              <ArrowLeft size={13} />
              <span>Back to Gateway Sign In</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
