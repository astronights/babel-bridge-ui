'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface AuthCtx {
  token: string | null
  username: string | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const t = localStorage.getItem('lt_token')
    const u = localStorage.getItem('lt_username')
    if (t) { setToken(t); setUsername(u) }
  }, [])

  const persist = (t: string, u: string) => {
    localStorage.setItem('lt_token', t)
    localStorage.setItem('lt_username', u)
    setToken(t)
    setUsername(u)
  }

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.auth.login(username, password)
    persist(res.access_token, res.username)
    router.push('/dashboard')
  }, [router])

  const register = useCallback(async (username: string, password: string) => {
    const res = await api.auth.register(username, password)
    persist(res.access_token, res.username)
    router.push('/dashboard')
  }, [router])

  const logout = useCallback(() => {
    localStorage.removeItem('lt_token')
    localStorage.removeItem('lt_username')
    setToken(null)
    setUsername(null)
    router.push('/')
  }, [router])

  return (
    <Ctx.Provider value={{ token, username, login, register, logout }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
