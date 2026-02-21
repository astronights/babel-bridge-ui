'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usePolling } from '@/hooks/usePolling'
import { api } from '@/lib/api'
import { Room, PLAYER_COLORS } from '@/types'
import { TopNav } from '@/components/ui/TopNav'
import { Button, Card, Alert, Badge, Spinner } from '@/components/ui'

export default function WaitingRoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  const { token } = useAuth()
  const [room, setRoom] = useState<Room | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)
  const [loading, setLoading] = useState(true)

  // Get user id from JWT
  useEffect(() => {
    if (!token) { router.push('/'); return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUserId(payload.sub)
    } catch { /* ignore */ }
  }, [token, router])

  const fetchRoom = useCallback(async () => {
    try {
      const data = await api.rooms.get(params.roomId)
      setRoom(data)
      setLoading(false)
      // If room has gone active, check for a conversation and navigate
      if (data.status === 'active') {
        const convs = await api.conversations.list(params.roomId)
        if (convs.length > 0) {
          router.push(`/rooms/${params.roomId}/conversation/${convs[0].id}`)
        }
      }
    } catch { /* silent */ }
  }, [params.roomId, router])

  useEffect(() => { fetchRoom() }, [fetchRoom])
  usePolling(fetchRoom, 2500, !!token)

  function copyCode() {
    if (!room) return
    navigator.clipboard.writeText(room.join_code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function startConversation() {
    if (!room) return
    setError(''); setStarting(true)
    try {
      const conv = await api.conversations.create(params.roomId, prompt || undefined)
      router.push(`/rooms/${params.roomId}/conversation/${conv.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to start conversation')
    } finally { setStarting(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <div className="flex-1 flex items-center justify-center">
        <Spinner className="w-8 h-8 text-muted" />
      </div>
    </div>
  )

  if (!room) return null

  const isHost = room.created_by === userId
  const isFull = room.members.length >= room.max_players

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <button onClick={() => router.push('/dashboard')} className="text-muted text-sm hover:text-ink mb-4 flex items-center gap-1 transition-colors">
          ← Back
        </button>

        <h2 className="font-playfair text-2xl font-bold mb-1">Waiting Room</h2>
        <p className="text-muted text-sm mb-5">
          {isHost ? 'Set a scenario and start when ready' : 'Waiting for the host to start…'}
        </p>

        {/* Room code */}
        <button onClick={copyCode} className="w-full bg-ink text-cream rounded-2xl p-5 text-center mb-4 hover:opacity-90 transition-opacity">
          <div className="font-playfair text-4xl font-black tracking-[0.5em] mb-1">{room.join_code}</div>
          <p className="text-cream/40 text-xs">{copied ? '✓ Copied!' : 'Tap to copy join code'}</p>
        </button>

        {/* Language / level info */}
        <div className="flex gap-2 mb-4">
          <Badge color="default">{room.language}</Badge>
          <Badge color="warn">{room.level}</Badge>
          <Badge color="muted">{room.members.length}/{room.max_players} players</Badge>
        </div>

        {/* Members */}
        <Card className="p-4 mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted mb-3">Players</h4>
          <div className="flex flex-col gap-2">
            {room.members.map((m, i) => (
              <div key={m.user_id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: PLAYER_COLORS[i % PLAYER_COLORS.length] }}>
                  {m.display_name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{m.display_name}</span>
                {m.user_id === room.created_by && (
                  <Badge color="default" >Host</Badge>
                )}
                {m.user_id === userId && (
                  <span className="text-xs text-muted ml-auto">you</span>
                )}
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: room.max_players - room.members.length }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 opacity-30">
                <div className="w-9 h-9 rounded-full bg-border flex items-center justify-center text-xs font-bold flex-shrink-0">
                  ?
                </div>
                <span className="text-sm text-muted">Waiting for player…</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Scenario input — host only */}
        {isHost && (
          <Card className="p-4 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-muted mb-2">Scenario (optional)</h4>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={2}
              placeholder="Leave blank for AI to pick a scenario, or describe your own…"
              className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-xl text-sm font-dm bg-cream text-ink outline-none focus:border-accent transition-colors resize-none"
            />
            <p className="text-xs text-muted mt-1.5">
              e.g. "Two friends argue about what to watch on TV"
            </p>
          </Card>
        )}

        {error && <Alert message={error} />}

        {/* Status / start */}
        <div className="bg-accent2/10 border border-accent2/20 rounded-xl px-4 py-3 text-sm text-accent2 mb-4">
          {isHost
            ? isFull
              ? `Room is full (${room.members.length} players). Start whenever!`
              : `${room.members.length} of ${room.max_players} joined. Start when ready, empty slots will be AI.`
            : 'Waiting for the host to start the conversation…'}
        </div>

        {isHost && (
          <Button full loading={starting} onClick={startConversation}>
            Start Conversation 🚀
          </Button>
        )}
      </main>
    </div>
  )
}
