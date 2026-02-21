'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { Room } from '@/types'
import { TopNav } from '@/components/ui/TopNav'
import { Button, Input, Select, Card, Alert, Badge, Spinner } from '@/components/ui'
import { useMeta } from '@/hooks/useMeta'

const LANG_COLORS: Record<string, string> = {
  Russian: '#e8643a',
  Chinese: '#e63946',
  Swedish: '#006aa7',
}

function RoomCard({ room, onClick }: { room: Room; onClick: () => void }) {
  const color = LANG_COLORS[room.language] ?? '#4a9eff'
  const statusBadge = room.status === 'completed'
    ? <Badge color="muted">Completed</Badge>
    : room.status === 'active'
      ? <Badge color="success">Active</Badge>
      : <Badge color="warn">Waiting</Badge>

  return (
    <button onClick={onClick} className="w-full text-left">
      <Card className="p-4 hover:border-accent hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
            style={{ background: color }}>
            {room.language.slice(0, 3).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{room.language} · {room.level}</p>
            <p className="text-xs text-muted mt-0.5">
              {room.members.length}/{room.max_players} players · Code: <strong>{room.join_code}</strong>
            </p>
          </div>
          {statusBadge}
        </div>
      </Card>
    </button>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { token, username } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const { meta } = useMeta()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Create form
  const [lang, setLang] = useState('')
  const [level, setLevel] = useState('')
  const [maxPlayers, setMaxPlayers] = useState('2')
  const [displayName, setDisplayName] = useState('')

  // Join form
  const [joinCode, setJoinCode] = useState('')
  const [joinName, setJoinName] = useState('')

  const loadRooms = useCallback(async () => {
    if (!token) return
    try {
      const data = await api.rooms.list()
      setRooms(data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => {
    if (!token) { router.push('/'); return }
    loadRooms()
  }, [token, router, loadRooms])

  useEffect(() => {
    if (!meta) return
    if (!lang) setLang(meta.languages[0]?.display_name ?? '')
    if (!level) setLevel(meta.levels[0]?.code ?? '')
  }, [meta])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSubmitting(true)
    try {
      const room = await api.rooms.create({
        language: lang, level, max_players: parseInt(maxPlayers), display_name: displayName,
      })
      router.push(`/rooms/${room.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create room')
    } finally { setSubmitting(false) }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSubmitting(true)
    try {
      const room = await api.rooms.join(joinCode.toUpperCase(), joinName)
      router.push(`/rooms/${room.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to join room')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="font-playfair text-2xl font-bold">Your Rooms</h2>
            <p className="text-muted text-sm mt-0.5">Pick up where you left off, or start something new</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => { setShowJoin(v => !v); setShowCreate(false); setError('') }}>
              Join Room
            </Button>
            <Button size="sm" onClick={() => { setShowCreate(v => !v); setShowJoin(false); setError('') }}>
              + Create Room
            </Button>
          </div>
        </div>

        {error && <Alert message={error} />}

        {/* Create form */}
        {showCreate && (
          <Card className="p-5 mb-5 animate-fade-up">
            <h3 className="font-playfair text-lg font-bold mb-4">Create a Room</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <Input label="Your Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Maria" required />
              <div className="grid grid-cols-2 gap-3">
                <Select label="Language" value={lang} onChange={e => setLang(e.target.value)}
                  options={(meta?.languages ?? []).map(l => ({ value: l.display_name, label: l.display_name }))} />
                <Select label="Level" value={level} onChange={e => setLevel(e.target.value)}
                  options={(meta?.levels ?? []).map(l => ({ value: l.code, label: l.code }))} />
              </div>
              <Select label="Max Players" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)}
                options={[2, 3, 4].map(n => ({ value: String(n), label: `${n} players` }))} />
              <div className="flex gap-2 mt-1">
                <Button type="submit" loading={submitting}>Create Room →</Button>
                <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Join form */}
        {showJoin && (
          <Card className="p-5 mb-5 animate-fade-up">
            <h3 className="font-playfair text-lg font-bold mb-4">Join a Room</h3>
            <form onSubmit={handleJoin} className="flex flex-col gap-3">
              <Input label="Your Display Name" value={joinName} onChange={e => setJoinName(e.target.value)}
                placeholder="e.g. Kenji" required />
              <Input label="Room Code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. AB3D9F" required
                className="text-center text-xl tracking-[0.3em] font-playfair font-bold" />
              <div className="flex gap-2 mt-1">
                <Button type="submit" loading={submitting}>Join Room →</Button>
                <Button type="button" variant="secondary" onClick={() => setShowJoin(false)}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Rooms list */}
        {loading ? (
          <div className="flex justify-center py-12"><Spinner className="w-8 h-8 text-muted" /></div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-muted">No rooms yet. Create one or join with a code!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {rooms.map(room => (
              <RoomCard key={room.id} room={room} onClick={() => router.push(`/rooms/${room.id}`)} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
