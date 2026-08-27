import { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AIAssistantTrigger from '@/components/AIAssistantTrigger';
import FloatingRightDock from '@/components/FloatingRightDock';
import QuickDashboardReturn from '@/components/QuickDashboardReturn';
import LiquidGlassBackground from '@/components/ui/LiquidGlassBackground';
import { ToastProvider } from '@/components/Toast';
import AutoTranslationBridge from '@/components/AutoTranslationBridge';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-primary',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-data',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Aartha — India's Verified Manufacturing Network",
  description: "India's verified manufacturing network connecting evidence-grounded manufacturers with global industrial buyers. Every factory proven.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col antialiased relative selection:bg-amber-500/20 selection:text-amber-600">
        <ToastProvider>
          <AutoTranslationBridge />
          <LiquidGlassBackground />
          <AnnouncementBar />
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <AIAssistantTrigger />
          <FloatingRightDock />
          <QuickDashboardReturn />
        </ToastProvider>
      </body>
    </html>
  );
}
