'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button, Input, Alert } from '@/components/ui'
import { useRouter } from 'next/dist/client/components/navigation'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { token } = useAuth()

  useEffect(() => {
    if (token) router.push('/dashboard')
  }, [token, router])

  if (token) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (mode === 'register' && password !== confirm) {
      return setError('Passwords do not match')
    }
    setLoading(true)
    try {
      if (mode === 'login') await login(username, password)
      else await register(username, password)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute w-[500px] h-[500px] rounded-full -top-24 -right-24 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(232,100,58,0.18) 0%, transparent 70%)' }} />
      <div className="absolute w-[350px] h-[350px] rounded-full -bottom-12 -left-16 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(74,158,255,0.12) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-playfair text-5xl font-black text-cream tracking-tight">
            Babel<span className="text-accent">Bridge</span>
          </h1>
          <p className="text-cream/40 text-sm mt-2">Practice languages with friends, guided by AI</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
          {/* Tabs */}
          <div className="flex border border-border rounded-xl overflow-hidden mb-5">
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 text-sm font-semibold transition-all ${mode === m ? 'bg-ink text-cream' : 'text-muted hover:text-ink'}`}>
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {error && <Alert message={error} />}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your username"
              required
              minLength={3}
              autoComplete="username"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {mode === 'register' && (
              <Input
                label="Confirm Password"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="repeat password"
                required
                autoComplete="new-password"
              />
            )}
            <Button type="submit" loading={loading} full className="mt-1">
              {mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </Button>
          </form>

          {/* Features strip */}
          <div className="flex flex-wrap gap-2 justify-center mt-5 pt-4 border-t border-border">
            {['🌍 Russian, Chinese, Swedish, et al!', '📊 A1–C2 levels', '🤖 AI conversations', '🔊 TTS + scoring'].map(f => (
              <span key={f} className="text-xs text-muted">{f}</span>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
