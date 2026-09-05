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
    default: "Aartha — Managed Manufacturing for Custom Precision Parts",
    template: "%s | Aartha Managed Manufacturing",
  },
  description: "Aartha manages custom precision sheet-metal parts from drawing to inspected delivery. Technical review, supplier selection, production, documented QA, and delivered parts.",
  keywords: [
    "Managed Manufacturing India",
    "Custom Precision Parts",
    "Sheet Metal Fabrication Gujarat",
    "Laser Cutting Press Brake Bending",
    "DFM Review Quality Inspection",
    "Custom Brackets Mounting Plates",
    "Hardware Startups Manufacturing Partner",
    "Contract Manufacturing India"
  ],
  authors: [{ name: "Aartha Platform" }],
  creator: "Aartha",
  publisher: "Aartha",
  alternates: {
    canonical: 'https://aartha.site',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/brand/aartha-logo.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  openGraph: {
    title: "Aartha — Managed Manufacturing for Custom Precision Parts",
    description: "Send us your drawing. We handle the rest — engineering review, supplier selection, production coordination, and documented inspection.",
    url: 'https://aartha.site',
    siteName: 'Aartha Platform',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Aartha — Managed Manufacturing for Custom Precision Parts",
    description: "Managed manufacturing execution layer for custom precision parts. From drawing to inspected delivery.",
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
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased relative bg-gradient-to-b from-[#dfe4f8] via-[#f7f8fd] to-white dark:from-[#0a1020] dark:via-[#0e1524] dark:to-[#060b13] text-[#0a1020] dark:text-[#f0f4fa] selection:bg-[#ff685c]/20 selection:text-[#ff685c]">
        <ToastProvider>
          <AutoTranslationBridge />
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
