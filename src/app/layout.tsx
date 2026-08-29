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
  metadataBase: new URL('https://aartha.site'),
  title: {
    default: "Aartha — India's Verified Manufacturing Network | B2B Directory",
    template: "%s | Aartha B2B",
  },
  description: "India's verified B2B manufacturing discovery network. Connect directly with authentic Gujarat factories in Chemicals, Textiles, Pharma, Engineering & Ceramics. Zero middleman fees.",
  keywords: [
    "B2B Marketplace India",
    "Gujarat Manufacturers Directory",
    "Verified Indian Suppliers",
    "Chemical Manufacturers Ankleshwar Dahej",
    "Textile Manufacturers Surat",
    "Engineering Brass Components Rajkot Jamnagar",
    "Ceramic Tiles Morbi",
    "IndiaMART Alternative",
    "Direct Factory Sourcing India",
    "GSTIN Verified Manufacturers"
  ],
  authors: [{ name: "Aartha Platform" }],
  creator: "Aartha",
  publisher: "Aartha",
  alternates: {
    canonical: 'https://aartha.site',
  },
  icons: {
    icon: '/brand/aartha-logo.png',
    shortcut: '/brand/aartha-logo.png',
    apple: '/brand/aartha-logo.png',
  },
  openGraph: {
    title: "Aartha — India's Verified Manufacturing Network",
    description: "Connect directly with verified Indian manufacturers. Real GPS-audited factories, zero brokerage fees, and verified GSTIN/IEC credentials.",
    url: 'https://aartha.site',
    siteName: 'Aartha B2B Platform',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Aartha — India's Verified Manufacturing Network",
    description: "Verified Indian B2B manufacturing network connecting global buyers directly with real factories.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const structuredSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://aartha.site/#website",
      "url": "https://aartha.site",
      "name": "Aartha",
      "alternateName": ["Aartha Platform", "Aartha B2B", "Aartha Manufacturing Network"],
      "description": "India's Verified B2B Manufacturing Network connecting global industrial buyers directly with authentic Gujarat factories.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://aartha.site/suppliers?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://aartha.site/#organization",
      "name": "Aartha",
      "legalName": "Aartha B2B Platform",
      "url": "https://aartha.site",
      "logo": "https://aartha.site/brand/aartha-logo.png",
      "description": "Evidence-grounded B2B manufacturing discovery & verification platform for Indian MSMEs and global industrial buyers.",
      "address": {
        "@type": "PostalAddress",
        "addressRegion": "Gujarat",
        "addressCountry": "IN"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "url": "https://aartha.site/contact"
      }
    },
    {
      "@type": "ItemList",
      "@id": "https://aartha.site/#sitelinks",
      "name": "Aartha Main Navigation & Directories",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Manufacturers Directory",
          "description": "Browse verified direct manufacturers across Gujarat industrial GIDC clusters",
          "url": "https://aartha.site/suppliers"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Post Sourcing RFQ",
          "description": "Submit raw technical specifications & get matched with verified factories",
          "url": "https://aartha.site/rfq"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Get Your Factory Listed",
          "description": "Register your Indian manufacturing plant and connect with global buyers with zero listing fees",
          "url": "https://aartha.site/get-listed"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "Verified Factories",
          "description": "View plant audit logs, GPS telemetry, and verified GSTIN/IEC credentials",
          "url": "https://aartha.site/verified"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "For Global Buyers",
          "description": "Zero brokerage B2B sourcing network for international and domestic procurement teams",
          "url": "https://aartha.site/for-buyers"
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredSchema) }}
        />
      </head>
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
