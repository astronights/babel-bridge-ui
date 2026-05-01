import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'

const dm = DM_Sans({ subsets: ['latin'], variable: '--font-dm', weight: ['300', '400', '500', '600'] })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', weight: ['400', '700', '900'] })

const BASE_URL = 'https://your-babel-bridge-url.vercel.app' // ← replace with your deployed URL

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'BabelBridge — AI Multiplayer Language Learning',
    template: '%s | BabelBridge',
  },
  description:
    'Practice Russian, Chinese, Swedish and more with friends. BabelBridge uses AI to run real conversations, score your responses and help you improve — play with anyone, anytime.',
  keywords: [
    'language learning app', 'multiplayer language learning', 'AI language practice',
    'practice languages with friends', 'Russian practice online', 'Chinese learning app',
    'language learning game', 'AI conversation practice',
  ],
  manifest: '/manifest.json',
  themeColor: '#1a1a2e',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BabelBridge',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'BabelBridge',
    title: 'BabelBridge — AI Multiplayer Language Learning',
    description:
      'Practice languages with friends, guided by AI. Real conversations, instant scoring, A1–C2 levels.',
    url: BASE_URL,
  },
  twitter: {
    card: 'summary',
    title: 'BabelBridge — AI Multiplayer Language Learning',
    description: 'Practice languages with friends, guided by AI. Real conversations, instant scoring.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1a2e" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" href="/icons/fish-icon.png" type="image/png" />
        <script dangerouslySetInnerHTML={{ __html: `
          if (typeof navigator.serviceWorker !== 'undefined') {
            navigator.serviceWorker.register('sw.js')
          }
        `}} />
      </head>
      <body className={`${dm.variable} ${playfair.variable} font-dm bg-cream min-h-screen`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
