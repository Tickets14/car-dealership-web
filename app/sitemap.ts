import type { MetadataRoute } from 'next';
import { toAbsoluteUrl } from '@/lib/seo';
import { fetchAvailableCarsForSitemap } from '@/lib/server/public-cars';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl('/'),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: toAbsoluteUrl('/cars'),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: toAbsoluteUrl('/sell'),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: toAbsoluteUrl('/pre-qualify'),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  try {
    const cars = await fetchAvailableCarsForSitemap();

    return [
      ...staticEntries,
      ...cars.map((car) => ({
        url: toAbsoluteUrl(`/cars/${car.id}`),
        lastModified: car.updated_at,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return staticEntries;
  }
}
