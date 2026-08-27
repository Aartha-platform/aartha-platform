"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, ArrowRight, Lock, Mail, Phone, 
  Building2, AlertTriangle, ArrowLeft, User, KeyRound, Check
} from 'lucide-react';
import { isBusinessEmail } from '@/lib/validation';

export default function SignUpPage() {
  const router = useRouter();

  // Registration state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'buyer' | 'supplier'>('buyer');
  
  // Turnstile state
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  // Status states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  // OTP Verification state
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(120); // 2 minutes

  // Restore OTP state from sessionStorage or URL searchParams on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlEmail = urlParams.get('email');
      const urlRole = urlParams.get('role') as 'buyer' | 'supplier' | null;

      if (urlEmail) {
        setEmail(urlEmail);
        if (urlRole) setRole(urlRole);
        setOtpSent(true);
        setSuccess('Your profile registration was initialized. Please enter the verification code sent to your email.');
        return;
      }

      const saved = sessionStorage.getItem('artha-pending-otp');
      if (saved) {
        const parsed = JSON.parse(saved);
        const elapsed = (Date.now() - parsed.timestamp) / 1000;
        if (elapsed < 120) {
          setEmail(parsed.email || '');
          setRole(parsed.role || 'buyer');
          if (parsed.phone) setPhone(parsed.phone);
          setOtpSent(true);
          setOtpCountdown(Math.max(1, Math.floor(120 - elapsed)));
          setSuccess(`Restored pending verification session for ${parsed.email}.`);
        } else {
          sessionStorage.removeItem('artha-pending-otp');
        }
      }
    } catch (e) {
      console.error('Failed to restore OTP session state:', e);
    }
  }, []);

  // Turnstile Injection
  useEffect(() => {
    if (otpSent) return; // No need for Turnstile during OTP input

    if (!document.getElementById('turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const checkTurnstile = setInterval(() => {
      // Use standard testing sitekey 2x00000000000000000000AB if env var not set (always passes on localhost)
      const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '2x00000000000000000000AB';
      if ((window as any).turnstile && turnstileRef.current) {
        clearInterval(checkTurnstile);
        try {
          (window as any).turnstile.render(turnstileRef.current, {
            sitekey,
            callback: (token: string) => {
              setTurnstileToken(token);
              setError('');
            },
            'error-callback': () => {
              setError('Security check failed to initialize. Please reload.');
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
  }, [otpSent]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (!otpSent || otpCountdown <= 0) return;
    const timer = setTimeout(() => setOtpCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpSent, otpCountdown]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Zod-like validations on client-side
    if (!email || !password || !confirmPassword || !companyName || !contactName || !phone) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isBusinessEmail(email)) {
      setError('Free email domains (Gmail, Yahoo, etc.) are restricted. Please use your corporate business email.');
      return;
    }

    if (password.length < 15) {
      setError('Password must be at least 15 characters long (NIST standard for passphrases).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Turnstile requirement check
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (sitekey && !turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          phone,
          companyName,
          contactName,
          role,
          turnstileToken
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        if ((window as any).turnstile) (window as any).turnstile.reset();
        setTurnstileToken(null);
        return;
      }

      // Save pending OTP state in sessionStorage to survive accidental refresh
      try {
        sessionStorage.setItem('artha-pending-otp', JSON.stringify({
          email,
          role,
          phone,
          timestamp: Date.now(),
        }));
      } catch {}

      setOtpSent(true);
      setOtpCountdown(120);
      setSuccess('Verification code sent successfully to your corporate email.');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    if (otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
      setOtpError('Please enter a valid 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: otpCode,
          role,
          phone
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || 'Verification failed.');
        return;
      }

      // Clear pending OTP state on successful verification
      try {
        sessionStorage.removeItem('artha-pending-otp');
      } catch {}

      // Login successful — replace history state to avoid back-button loop
      window.location.replace(role === 'buyer' ? '/dashboard' : '/supplier-dashboard');
    } catch {
      setOtpError('Network error during verification. Try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    setOtpError('');
    setIsVerifying(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password, // resend needs parameters or we can adjust logic
          phone,
          companyName,
          contactName,
          role
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || 'Failed to resend code.');
        return;
      }
      setOtpCountdown(120);
      setSuccess('A new 6-digit verification code has been sent.');
    } catch {
      setOtpError('Failed to request new code due to network error.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans flex flex-col justify-between text-text-primary">
      {/* Main Grid Wrapper */}
      <div className="max-w-5xl mx-auto w-full px-4 py-8 md:py-16 flex items-center justify-center flex-1">
        <div className="bg-white dark:bg-[var(--surface)] border border-slate-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-premium-lg w-full grid grid-cols-1 md:grid-cols-[1.2fr_1fr] min-h-[600px]">
          
          {/* Left Panel: Signup fields */}
          <div className="p-6 md:p-10 flex flex-col justify-between space-y-6 bg-white dark:bg-[var(--surface)]">
            
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-1 shadow-xs flex items-center justify-center overflow-hidden">
                  <img src="/brand/aartha-logo.png" alt="Aartha Logo" className="w-full h-full object-contain dark:invert" />
                </div>
                <span className="font-extrabold tracking-wider text-xs text-navy dark:text-white uppercase">AARTHA PLATFORM</span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase text-navy tracking-tight">
                  {otpSent ? 'Verify Corporate Profile' : 'Register Corporate Account'}
                </h1>
                <p className="text-[11px] text-text-muted font-medium mt-0.5">
                  {otpSent 
                    ? `Enter the 6-digit verification code sent to ${email}`
                    : 'Access India\'s most verified B2B sourcing and export corridor.'
                  }
                </p>
              </div>
            </div>

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

            {!otpSent ? (
              /* Registration Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`flex-1 text-center py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      role === 'buyer' ? 'bg-white text-navy shadow-sm' : 'text-text-muted hover:text-navy'
                    }`}
                  >
                    Buyer Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('supplier')}
                    className={`flex-1 text-center py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      role === 'supplier' ? 'bg-white text-navy shadow-sm' : 'text-text-muted hover:text-navy'
                    }`}
                  >
                    Supplier Account
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="contact-name" className="block text-[10px] font-bold uppercase tracking-wider text-text-primary">
                      Contact Name
                    </label>
                    <div className="relative">
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="John Doe"
                        disabled={isSubmitting}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy focus:outline-none transition-colors font-semibold"
                      />
                      <User size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="company-name" className="block text-[10px] font-bold uppercase tracking-wider text-text-primary">
                      Company Name
                    </label>
                    <div className="relative">
                      <input
                        id="company-name"
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme Corp"
                        disabled={isSubmitting}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy focus:outline-none transition-colors font-semibold"
                      />
                      <Building2 size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-text-primary">
                      Business Email
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@company.com"
                        disabled={isSubmitting}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy focus:outline-none transition-colors font-semibold"
                      />
                      <Mail size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="block text-[10px] font-bold uppercase tracking-wider text-text-primary">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        disabled={isSubmitting}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy focus:outline-none transition-colors font-semibold"
                      />
                      <Phone size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-text-primary">
                      Password (min 15 chars)
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••••••"
                        disabled={isSubmitting}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy focus:outline-none transition-colors font-semibold"
                      />
                      <Lock size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="confirm-password" className="block text-[10px] font-bold uppercase tracking-wider text-text-primary">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••••••"
                        disabled={isSubmitting}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-navy focus:outline-none transition-colors font-semibold"
                      />
                      <KeyRound size={14} className="absolute left-3.5 top-3.5 text-text-muted" />
                    </div>
                  </div>
                </div>

                {/* Cloudflare Turnstile */}
                <div className="flex justify-center py-2">
                  <div ref={turnstileRef}></div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-amber text-xs font-extrabold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Registering SecOps...' : 'Initiate Verification OTP'}
                  <ArrowRight size={14} />
                </button>

                {role === 'buyer' && (
                  <>
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-slate-200"></div>
                      <span className="flex-shrink mx-4 text-[9px] font-bold text-text-muted uppercase tracking-wider">Or Register with</span>
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
                      <span>Register with Google Workspace</span>
                    </button>
                  </>
                )}

                <div className="text-center pt-2">
                  <span className="text-[10px] text-text-muted">
                    Already have an account?{' '}
                    <Link href="/signin" className="text-navy font-bold hover:underline">
                      Sign In here
                    </Link>
                  </span>
                </div>
              </form>
            ) : (
              /* OTP Verification Form */
              <form onSubmit={handleOtpVerify} className="space-y-5">
                {otpError && (
                  <div className="bg-red-50 text-red-700 text-xs font-bold p-2.5 rounded-lg border border-red-100 flex items-start gap-2">
                    <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                    <span>{otpError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="otp-code" className="block text-[10px] font-bold uppercase tracking-wider text-text-primary text-center">
                    6-Digit Verification Code
                  </label>
                  <input
                    id="otp-code"
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000 000"
                    disabled={isVerifying}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl px-4 py-3.5 text-lg text-navy text-center focus:outline-none transition-colors font-bold tracking-widest font-mono"
                  />
                </div>

                <div className="text-center text-[10px] text-text-muted font-semibold">
                  {otpCountdown > 0 ? (
                    <span>Resend code in <strong className="text-navy">{otpCountdown}s</strong></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isVerifying}
                      className="text-navy font-black uppercase tracking-wider hover:underline cursor-pointer"
                    >
                      Resend Verification Code
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || otpCode.length !== 6}
                  className="w-full bg-navy hover:bg-navy-light text-white text-xs font-extrabold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isVerifying ? 'Verifying profile...' : 'Verify & Establish Session'}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-text-muted hover:text-navy text-[10px] font-bold uppercase tracking-wider text-center mt-2 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft size={10} /> Back to Register Details
                </button>
              </form>
            )}

          </div>

          {/* Right Panel: Aartha Branding */}
          <div className="bg-navy text-white p-6 md:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                Aartha Verified Network
              </span>
              
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase tracking-tight text-white leading-snug">
                  Securing India's Supply Chain Gateways
                </h3>
                <p className="text-xs text-slate-400 leading-normal">
                  All accounts undergo real-time validation against business records, DGFT registries, and GIDC factory indices to guarantee zero shell operations.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">
                Secure Infrastructure Highlights:
              </h4>

              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5">
                  <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
                    <ShieldCheck size={14} />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold uppercase text-white tracking-wide leading-tight">Secure Signatures & Tokens</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Stateless session cookies are HMAC signed using cryptographically secure parameters to prevent tampering.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
                    <Lock size={14} />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold uppercase text-white tracking-wide leading-tight">NIST Passphrase Policy</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Enforcing longer, memorable passphrases with breach screening lookup to block compromised passwords.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
              <div className="space-y-0.5 bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="text-base font-black text-amber-400 leading-tight">2-Min</div>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">OTP Expiration</div>
              </div>
              <div className="space-y-0.5 bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="text-base font-black text-[#34D399] leading-tight">3 Max</div>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Verification Attempts</div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <footer className="max-w-7xl mx-auto w-full px-4 py-5 border-t border-slate-200 mt-auto flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted bg-transparent">
        <p>Need register assistance? Contact regional GIDC Trade Desk: <strong className="text-navy">+91 72084 32138</strong></p>
        <div className="flex gap-4 mt-2 sm:mt-0 font-extrabold uppercase text-[10px] tracking-wider">
          <Link href="/about" className="hover:text-amber-500 transition-colors">About Audits</Link>
          <span>•</span>
          <Link href="/verified" className="hover:text-amber-500 transition-colors">Trust Center</Link>
        </div>
      </footer>
    </div>
  );
}
