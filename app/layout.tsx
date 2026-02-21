import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'

const dm = DM_Sans({ subsets: ['latin'], variable: '--font-dm', weight: ['300', '400', '500', '600'] })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', weight: ['400', '700', '900'] })

export const metadata: Metadata = {
  title: 'Babel Bridge',
  description: 'AI-powered multiplayer language learning',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dm.variable} ${playfair.variable} font-dm bg-cream min-h-screen`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
