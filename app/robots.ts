import type { MetadataRoute } from 'next'

const BASE_URL = 'https://babel-bridge-ui.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/privacy'],
        disallow: ['/dashboard', '/rooms/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
