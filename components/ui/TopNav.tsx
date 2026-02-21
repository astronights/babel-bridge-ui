'use client'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export function TopNav() {
  const { username, logout } = useAuth()
  return (
    <nav className="bg-ink text-cream px-5 py-3 flex items-center justify-between flex-shrink-0">
      <Link href="/dashboard" className="font-playfair text-xl font-black tracking-tight">
        Babel<span className="text-accent">Bridge</span>
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-cream/50 text-sm hidden sm:block">👤 {username}</span>
        <button onClick={logout} className="text-cream/50 hover:text-cream text-sm transition-colors">
          Sign out
        </button>
      </div>
    </nav>
  )
}
