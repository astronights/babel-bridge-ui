import type { MetadataRoute } from 'next'

const BASE_URL = 'https://your-babel-bridge-url.vercel.app' // ← replace with your deployed URL

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
