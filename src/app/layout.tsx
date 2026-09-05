import { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';
import AutoTranslationBridge from '@/components/AutoTranslationBridge';
import './globals.css';

const inter = Inter({
  variable: '--font-primary',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-data',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
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
      "alternateName": ["Aartha Platform", "Aartha Managed Manufacturing"],
      "description": "Managed manufacturing for custom precision parts. Send your drawing — Aartha handles engineering review, supplier selection, production, inspection, and delivery.",
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
      "legalName": "Aartha Platform",
      "url": "https://aartha.site",
      "logo": "https://aartha.site/brand/aartha-logo.png",
      "description": "Managed manufacturing execution layer for custom precision parts — from drawing to inspected delivery.",
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
      "@type": "Service",
      "@id": "https://aartha.site/#service",
      "name": "Managed Manufacturing Service",
      "description": "End-to-end managed manufacturing for custom sheet-metal parts: RFQ intake, DFM review, supplier selection, production coordination, dimensional inspection, and delivered parts.",
      "provider": { "@id": "https://aartha.site/#organization" },
      "serviceType": "Contract Manufacturing Management",
      "areaServed": "IN",
      "url": "https://aartha.site/rfq"
    },
    {
      "@type": "ItemList",
      "@id": "https://aartha.site/#sitelinks",
      "name": "Aartha Navigation",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Send an RFQ",
          "description": "Upload your drawing and receive a managed manufacturing quote",
          "url": "https://aartha.site/rfq"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Production Network",
          "description": "Browse qualified suppliers across Gujarat industrial GIDC clusters",
          "url": "https://aartha.site/suppliers"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "How It Works",
          "description": "Drawing to delivered part — the managed manufacturing workflow",
          "url": "https://aartha.site/how-it-works"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "Get Your Factory Listed",
          "description": "Join Aartha's qualified supplier network",
          "url": "https://aartha.site/get-listed"
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
      <body className="min-h-screen flex flex-col antialiased relative bg-[#f8fafc] text-[#0f172a] selection:bg-[#ff685c]/20 selection:text-[#ff685c]">
        <ToastProvider>
          <AutoTranslationBridge />
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
