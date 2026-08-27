import { MetadataRoute } from 'next';
import { suppliers } from '@/data/suppliers';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aartha.site';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/for-buyers', '/for-suppliers', '/suppliers', '/suppliers/', '/verified', '/categories', '/rfq', '/get-listed', '/about', '/blog', '/blog/', '/how-it-works', '/contact', '/legal/'],
        disallow: ['/admin', '/dashboard', '/supplier-dashboard', '/api/', '/signin'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
