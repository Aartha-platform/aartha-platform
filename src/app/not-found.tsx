import Link from 'next/link';
import { Shield, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 font-sans text-text-primary">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-navy p-4 rounded-2xl">
            <Shield size={40} className="text-gold" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-navy tracking-tight">404</h1>
          <h2 className="text-xl font-bold uppercase tracking-wide">Page Not Found</h2>
          <p className="text-text-secondary text-xs max-w-xs mx-auto leading-relaxed">
            The page you are looking for does not exist. Return to the homepage to explore verified manufacturers.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-navy text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-navy-light transition-all cursor-pointer select-none no-underline"
        >
          <Home size={14} />
          <span>Back to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
