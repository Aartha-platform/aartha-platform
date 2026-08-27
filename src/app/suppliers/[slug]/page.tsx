import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { suppliers } from '@/data/suppliers';
import SupplierProfileClient from '@/components/SupplierProfileClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return suppliers.map((s) => ({
    slug: s.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supplier = suppliers.find((s) => s.slug === slug);
  
  if (!supplier) {
    return {
      title: 'Supplier Not Found | Aartha',
    };
  }

  return {
    title: `${supplier.companyName} — Verified Gujarat Manufacturer | Aartha`,
    description: `Dynamic quality scores, audit logs, and verified GIDC plant credentials for ${supplier.companyName} in the India-Export Corridor.`,
  };
}

export default async function SupplierProfilePage({ params }: Props) {
  const { slug } = await params;
  const supplier = suppliers.find((s) => s.slug === slug);

  if (!supplier) {
    notFound();
  }

  const productSchemas = supplier.products.map((prodName) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": prodName,
    "description": `Verified manufacturer export grade ${prodName} catalog listed on Aartha.`,
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "10",
      "highPrice": "100000",
      "offerCount": "1"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": supplier.companyName,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": supplier.location.city,
        "addressRegion": supplier.location.state,
        "addressCountry": "IN"
      }
    }
  }));

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": supplier.companyName,
    "description": supplier.about,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": supplier.location.fullAddress,
      "addressLocality": supplier.location.city,
      "addressRegion": supplier.location.state,
      "addressCountry": "IN"
    },
    "telephone": supplier.phone || "+91 72084 32138",
    "url": `https://aartha.site/suppliers/${supplier.slug}`
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {productSchemas.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <SupplierProfileClient supplier={supplier} />
    </>
  );
}
