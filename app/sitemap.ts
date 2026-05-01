import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://mademeinvoice.com'
  return [
    { url: base, changeFrequency: 'weekly', priority: 1, lastModified: new Date() },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${base}/pricing`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${base}/signup`, changeFrequency: 'monthly', priority: 0.7, lastModified: new Date() },
    { url: `${base}/login`, changeFrequency: 'monthly', priority: 0.4, lastModified: new Date() },
  ]
}
