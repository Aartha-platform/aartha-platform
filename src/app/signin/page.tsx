"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, FileText, Award, ArrowRight, Lock, 
  Check, Mail, Phone, Building2, AlertTriangle, ArrowLeft
} from 'lucide-react';
import { isBusinessEmail } from '@/lib/validation';
import { useSession, getDashboardPath } from '@/hooks/useSession';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/dashboard';
  const errorParam = searchParams?.get('error');

  const { user, loading: sessionLoading } = useSession();

  // Auto-redirect already authenticated users to dashboard
  useEffect(() => {
    if (!sessionLoading && user?.authenticated) {
      router.replace(redirectTo || getDashboardPath(user.role));
    }
  }, [user, sessionLoading, router, redirectTo]);

  const [activeTab, setActiveTab] = useState<'buyer' | 'supplier'>('buyer');

  // Buyer Form State
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPassword, setBuyerPassword] = useState('');
  const [buyerError, setBuyerError] = useState('');
  const [isBuyerSubmitting, setIsBuyerSubmitting] = useState(false);

  // Turnstile State
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  // Supplier Form State
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierGstin, setSupplierGstin] = useState('');
  const [supplierError, setSupplierError] = useState('');
  const [supplierSuccess, setSupplierSuccess] = useState('');
  const [isSupplierSubmitting, setIsSupplierSubmitting] = useState(false);
  const [supplierOtpSent, setSupplierOtpSent] = useState(false);
  const [supplierOtp, setSupplierOtp] = useState('');
  const [supplierOtpCountdown, setSupplierOtpCountdown] = useState(0);
  const [supplierCompanyName, setSupplierCompanyName] = useState('');

  // Supplier OTP Countdown Effect
  useEffect(() => {
    if (supplierOtpCountdown <= 0) return;
    const timer = setInterval(() => {
      setSupplierOtpCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [supplierOtpCountdown]);

  // Admin Form State
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);

  // Turnstile Injection
  useEffect(() => {
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!sitekey) return;

    if (!document.getElementById('turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const checkTurnstile = setInterval(() => {
      if ((window as any).turnstile && turnstileRef.current) {
        clearInterval(checkTurnstile);
        try {
          (window as any).turnstile.render(turnstileRef.current, {
            sitekey,
            callback: (token: string) => {
              setTurnstileToken(token);
              setBuyerError('');
              setSupplierError('');
            },
            'error-callback': () => {
              setBuyerError('Security check failed to initialize. Please reload.');
            }
          });
        } catch (e) {
          console.error('Turnstile render error:', e);
        }
      }
    }, 100);

    return () => {
      clearInterval(checkTurnstile);
    };
  }, [showAdminLogin, activeTab]);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (!adminSecret) {
      setAdminError('Please enter the administrative credentials code.');
      return;
    }

    setIsAdminSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ role: 'admin', adminSecret }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdminError(data.error || 'Invalid administrative credentials.');
        return;
      }
      window.location.replace('/admin');
    } catch {
      setAdminError('Network error. Please try again.');
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const handleBuyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuyerError('');

    if (!buyerEmail || !buyerPassword) {
      setBuyerError('Please enter both your business email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyerEmail)) {
      setBuyerError('Please enter a valid email address.');
      return;
    }

    if (!isBusinessEmail(buyerEmail)) {
      setBuyerError('Free email addresses (Gmail, Yahoo, etc.) are not allowed. Please use your corporate email.');
      return;
    }

    // Require Turnstile token if sitekey is set
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (sitekey && !turnstileToken) {
      setBuyerError('Please complete the security check.');
      return;
    }

    setIsBuyerSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ 
          role: 'buyer', 
          email: buyerEmail, 
          password: buyerPassword,
          turnstileToken
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.unverified) {
          // If the profile is registered but unverified, redirect to signup/verification page
          window.location.replace(`/signup?email=${encodeURIComponent(buyerEmail)}&role=buyer`);
          return;
        }
        setBuyerError(data.error || 'Login failed. Please try again.');
        if ((window as any).turnstile) (window as any).turnstile.reset();
        setTurnstileToken(null);
        return;
      }
      const targetUrl = redirectTo.startsWith('/supplier-dashboard') || redirectTo.startsWith('/admin') ? '/dashboard' : redirectTo;
      window.location.replace(targetUrl);
    } catch {
      setBuyerError('Network error. Please check your connection and try again.');
    } finally {
      setIsBuyerSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/google';
  };

  const handleSupplierOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupplierError('');
    setSupplierSuccess('');

    if (!supplierPhone) {
      setSupplierError('Please enter your registered mobile number.');
      return;
    }

    const cleanPhone = supplierPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setSupplierError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSupplierSubmitting(true);
    try {
      const res = await fetch('/api/auth/supplier-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: supplierPhone,
          turnstileToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSupplierError(data.error || 'Failed to send OTP code.');
        if ((window as any).turnstile) (window as any).turnstile.reset();
        setTurnstileToken(null);
        return;
      }
      setSupplierOtpSent(true);
      setSupplierOtpCountdown(120);
      setSupplierCompanyName(data.companyName || '');
      setSupplierSuccess(data.message || 'OTP code sent to your registered phone number.');
    } catch {
      setSupplierError('Network error. Please check your connection and try again.');
    } finally {
      setIsSupplierSubmitting(false);
    }
  };

  const handleSupplierOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupplierError('');

    if (!supplierOtp || supplierOtp.trim().length !== 6) {
      setSupplierError('Please enter the full 6-digit OTP code.');
      return;
    }

    setIsSupplierSubmitting(true);
    try {
      const res = await fetch('/api/auth/supplier-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          phone: supplierPhone,
          otp: supplierOtp.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSupplierError(data.error || 'Verification failed. Please try again.');
        return;
      }
      const targetRedirect = redirectTo.startsWith('/supplier-dashboard') ? redirectTo : '/supplier-dashboard';
      window.location.replace(targetRedirect);
    } catch {
      setSupplierError('Network error. Please verify your connection.');
    } finally {
      setIsSupplierSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans flex flex-col justify-between text-text-primary">
      
      {/* Main Grid Wrapper */}
      <div className="max-w-5xl mx-auto w-full px-4 py-8 md:py-16 flex items-center justify-center flex-1">
        
        <div className="bg-white dark:bg-[var(--surface)] border border-slate-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-premium-lg w-full grid grid-cols-1 md:grid-cols-[1.2fr_1fr] min-h-[560px]">
          
          {/* Left Panel: White, clean, high-end login fields */}
          <div className="p-6 md:p-10 flex flex-col justify-between space-y-8 bg-white dark:bg-[var(--surface)]">
            
            {/* Header / Logo */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1 shadow-xs flex items-center justify-center overflow-hidden">
                  <img src="/brand/aartha-logo.png" alt="Aartha Logo" className="w-full h-full object-contain dark:invert" />
                </div>
                <span className="font-extrabold tracking-wider text-xs text-navy dark:text-white uppercase">AARTHA PLATFORM</span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase text-navy tracking-tight">
                  Enter the Gateway
                </h1>
                <p className="text-[11px] text-text-muted font-medium mt-0.5">
                  Sign in to access your secure B2B corridor workspace dashboard.
                </p>
              </div>
            </div>

             {/* Error notifications */}
             {errorParam === 'unauthorized' && (
               <div className="bg-red-50 text-red-700 text-xs font-bold p-3.5 rounded-xl border border-red-100 flex items-start gap-2">
                 <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                 <span>You do not have administrative authorization to access that panel. Please use a verified user sign-in.</span>
               </div>
             )}

             {errorParam === 'session_expired' && (
               <div className="bg-amber-50 text-amber-800 text-xs font-bold p-3.5 rounded-xl border border-amber-100 flex items-start gap-2">
                 <AlertTriangle size={15} className="flex-shrink-0 mt-0.5 text-amber-600" />
                 <span>Your secure workspace session has expired. Please sign in again to resume.</span>
               </div>
             )}

            {showAdminLogin ? (
              /* Admin Workspace */
              <div className="space-y-5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <div className="bg-amber-100 p-2 rounded-xl text-amber-700">
                    <Lock size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-navy">Administrative Access</h3>
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Secured Corridor Control</p>
                  </div>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="admin-secret" className="block text-[10px] font-bold uppercase tracking-wider text-text-primary">
                      Administrative Passcode
                    </label>
                    <input
                      id="admin-secret"
                      type="password"
                      required
                      value={adminSecret}
                      onChange={(e) => {
                        setAdminSecret(e.target.value);
                        if (adminError) setAdminError('');
                      }}
                      placeholder="••••••••••••••••"
                      disabled={isAdminSubmitting}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-navy focus:outline-none transition-colors text-center font-bold tracking-widest font-mono"
                    />
                  </div>

                  {adminError && (
                    <div className="bg-red-50 text-red-700 text-[10px] font-bold p-2.5 rounded-lg border border-red-100 flex items-start gap-2">
                      <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAdminSubmitting}
                    className="w-full bg-gradient-to-r from-[#0B1628] to-[#1E293B] hover:opacity-95 text-white text-xs font-extrabold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isAdminSubmitting ? 'Verifying SecOps...' : 'Authorize Administrative Session'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminLogin(false);
                      setAdminSecret('');
                      setAdminError('');
                    }}
                    className="w-full text-text-muted hover:text-navy text-[10px] font-bold uppercase tracking-wider text-center mt-2 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={10} /> Back to Sourcing Sign In
                  </button>
                </form>
              </div>
            ) : (
              /* Public Forms Switcher */
              <div className="space-y-5">
                {/* Switcher Pills */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                  <button
                    onClick={() => setActiveTab('buyer')}
                    className={`flex-1 text-center py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 'buyer' ? 'bg-white text-navy shadow-sm' : 'text-text-muted hover:text-navy'
                    }`}
                  >
                    Buyer Login
                  </button>
                  <button
                    onClick={() => setActiveTab('supplier')}
                    className={`flex-1 text-center py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 'supplier' ? 'bg-white text-navy shadow-sm' : 'text-text-muted hover:text-navy'
                    }`}
                  >
                    Supplier Login
                  </button>
                </div>

                {activeTab === 'buyer' ? (
                  <div className="space-y-4">
                    <form onSubmit={handleBuyerSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="buyer-email" className="block text-[10px] font-bold uppercase tracking-wider text-text-primary">
                          Business Email
                        </label>
                        <div className="relative">
                          <input
                            id="buyer-email"
                            type="email"
                            value={buyerEmail}
                            onChange={(e) => {
                              setBuyerEmail(e.target.value);
                              if (buyerError) setBuyerError('');
                            }}
                            placeholder="name@company.com"
                            disabled={isBuyerSubmitting}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl pl-10 pr-4 py-3 text-xs text-navy focus:outline-none transition-colors font-semibold"
                          />
                          <Mail size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
                        </div>
                        <span className="block text-[9px] text-text-muted">
                          Login is restricted to verified enterprise business domains.
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="buyer-password" className="block text-[10px] font-bold uppercase tracking-wider text-text-primary">
                            Password
                          </label>
                          <Link href="/forgot-password" className="text-[10px] font-extrabold text-navy hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <input
                            id="buyer-password"
                            type="password"
                            required
                            value={buyerPassword}
                            onChange={(e) => {
                              setBuyerPassword(e.target.value);
                              if (buyerError) setBuyerError('');
                            }}
                            placeholder="••••••••••••"
                            disabled={isBuyerSubmitting}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl pl-10 pr-4 py-3 text-xs text-navy focus:outline-none transition-colors font-semibold"
                          />
                          <Lock size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
                        </div>
                      </div>

                      {/* Cloudflare Turnstile */}
                      <div className="flex justify-center py-1">
                        <div ref={turnstileRef}></div>
                      </div>

                      {buyerError && (
                        <div className="bg-red-50 text-red-700 text-[10px] font-bold p-2.5 rounded-lg border border-red-100 flex items-start gap-2">
                          <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                          <span>{buyerError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isBuyerSubmitting}
                        className="w-full btn-amber text-xs font-extrabold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isBuyerSubmitting ? (
                          <span>Connecting Sourcing OS...</span>
                        ) : (
                          <>
                            <span>Access Buyer Workspace</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>

                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-4 text-[9px] font-bold text-text-muted uppercase tracking-wider">Or continue with</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-navy text-xs font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Sign in with Google</span>
                      </button>

                      <div className="text-center pt-2">
                        <span className="text-[10px] text-text-muted">
                          Don't have a corporate account?{' '}
                          <Link href="/signup" className="text-navy font-bold hover:underline">
                            Register here
                          </Link>
                        </span>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!supplierOtpSent ? (
                      <form onSubmit={handleSupplierOtpRequest} className="space-y-4">
                        <div className="space-y-1.5">
                          <label htmlFor="supplier-phone" className="block text-[10px] font-bold uppercase tracking-wider text-text-primary">
                            Registered Supplier Mobile
                          </label>
                          <div className="relative">
                            <input
                              id="supplier-phone"
                              type="tel"
                              required
                              value={supplierPhone}
                              onChange={(e) => {
                                setSupplierPhone(e.target.value);
                                if (supplierError) setSupplierError('');
                              }}
                              placeholder="e.g. 98765 43210"
                              disabled={isSupplierSubmitting}
                              className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl pl-10 pr-4 py-3 text-xs text-navy focus:outline-none transition-colors font-semibold"
                            />
                            <Phone size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
                          </div>
                          <span className="block text-[9px] text-text-muted">
                            Login is restricted to verified Aartha supplier partners registered in Gujarat GIDC directories.
                          </span>
                        </div>

                        {/* Cloudflare Turnstile */}
                        <div className="flex justify-center py-1">
                          <div ref={turnstileRef}></div>
                        </div>

                        {supplierError && (
                          <div className="bg-red-50 text-red-700 text-[10px] font-bold p-2.5 rounded-lg border border-red-100 flex items-start gap-2">
                            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                            <span>{supplierError}</span>
                          </div>
                        )}

                        {supplierSuccess && (
                          <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold p-2.5 rounded-lg border border-emerald-100">
                            {supplierSuccess}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSupplierSubmitting}
                          className="w-full bg-navy hover:bg-navy-light text-white text-xs font-extrabold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          {isSupplierSubmitting ? (
                            <span>Generating SMS Code...</span>
                          ) : (
                            <>
                              <span>Request Login OTP</span>
                              <ArrowRight size={14} />
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleSupplierOtpVerify} className="space-y-4">
                        <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 space-y-1">
                          <span className="text-[10px] font-bold text-amber-900 block">
                            {supplierCompanyName ? `Welcome back, ${supplierCompanyName}` : 'Supplier Mobile Verification'}
                          </span>
                          <p className="text-[10px] text-amber-800 font-medium">
                            Enter the 6-digit verification code sent to <strong className="font-bold">+91-XXXXX-{supplierPhone.slice(-4)}</strong>.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label htmlFor="supplier-otp" className="block text-[10px] font-bold uppercase tracking-wider text-text-primary">
                            6-Digit Verification Code
                          </label>
                          <input
                            id="supplier-otp"
                            type="text"
                            maxLength={6}
                            required
                            value={supplierOtp}
                            onChange={(e) => {
                              setSupplierOtp(e.target.value.replace(/\D/g, ''));
                              if (supplierError) setSupplierError('');
                            }}
                            placeholder="123456"
                            disabled={isSupplierSubmitting}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-navy rounded-xl px-4 py-3 text-center text-lg tracking-[0.4em] text-navy font-bold focus:outline-none transition-colors"
                          />
                        </div>

                        {supplierError && (
                          <div className="bg-red-50 text-red-700 text-[10px] font-bold p-2.5 rounded-lg border border-red-100 flex items-start gap-2">
                            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                            <span>{supplierError}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSupplierSubmitting}
                          className="w-full btn-amber text-xs font-extrabold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          {isSupplierSubmitting ? (
                            <span>Verifying Code...</span>
                          ) : (
                            <>
                              <span>Verify & Access Dashboard</span>
                              <ArrowRight size={14} />
                            </>
                          )}
                        </button>

                        <div className="flex items-center justify-between text-[10px] pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSupplierOtpSent(false);
                              setSupplierOtp('');
                              setSupplierError('');
                            }}
                            className="text-text-muted hover:text-navy font-semibold"
                          >
                            ← Change Phone Number
                          </button>

                          {supplierOtpCountdown > 0 ? (
                            <span className="text-text-muted font-medium">Resend code in {supplierOtpCountdown}s</span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSupplierOtpRequest}
                              className="text-navy font-bold hover:underline"
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Administrative Entry Switch */}
                <div className="text-center pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(true)}
                    className="text-text-muted hover:text-navy text-[9px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer select-none bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/60"
                  >
                    🔒 Administrative Authorization Console
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Official trust branding and verification credentials list */}
          <div className="bg-navy text-white p-6 md:p-10 flex flex-col justify-between space-y-6">
            
            {/* Header info */}
            <div className="space-y-4">
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                Aartha Verified Network
              </span>
              
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase tracking-tight text-white leading-snug">
                  India's Most Trusted B2B Export Corridor
                </h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Connecting verified Gujarat manufacturers directly with international enterprise procurement networks.
                </p>
              </div>
            </div>

            {/* Official Credentials Checkmarks */}
            <div className="space-y-4">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">
                Platform Credentials:
              </h4>

              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5">
                  <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
                    <ShieldCheck size={14} />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold uppercase text-white tracking-wide leading-tight">DPIIT Recognized Platform</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Approved under startup recognition protocols by the Ministry of Commerce & Industry, Govt. of India.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
                    <Building2 size={14} />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold uppercase text-white tracking-wide leading-tight">Active GIDC Zone Indexing</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Direct onboarding from major Gujarat manufacturing zones (Vatva, Naroda, Sachin, Ankleshwar GIDC).</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
                    <FileText size={14} />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold uppercase text-white tracking-wide leading-tight">DGFT IEC Registry Sync</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Real-time validation of government Import-Export Codes to prevent shell-trading profiles.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Stats */}
            <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
              <div className="space-y-0.5 bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="text-base font-black text-amber-400 leading-tight">4-Tier</div>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Verification Depth</div>
              </div>
              <div className="space-y-0.5 bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="text-base font-black text-[#34D399] leading-tight">Gujarat</div>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Focus Corridor</div>
              </div>
            </div>

          </div>

        </div>

      </div>

      <footer className="max-w-7xl mx-auto w-full px-4 py-5 border-t border-slate-200 mt-auto flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted bg-transparent">
        <p>Need corridor validation support? Contact regional GIDC Trade Desk: <strong className="text-navy">+91 72084 32138</strong></p>
        <div className="flex gap-4 mt-2 sm:mt-0 font-extrabold uppercase text-[10px] tracking-wider">
          <Link href="/about" className="hover:text-amber-500 transition-colors">About Audits</Link>
          <span>•</span>
          <Link href="/verified" className="hover:text-amber-500 transition-colors">Trust Center</Link>
        </div>
      </footer>
    </div>
  );
}
