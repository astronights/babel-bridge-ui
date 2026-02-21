'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { Conversation, Room, PLAYER_COLORS, SCORE_COLOR, SCORE_BG } from '@/types'
import { TopNav } from '@/components/ui/TopNav'
import { Button, Card, Spinner, Badge } from '@/components/ui'
import { clsx } from 'clsx'
import { useMeta } from '@/hooks/useMeta'

function PlayerSummary({
  displayName, scores, color, isYou,
}: { displayName: string; scores: number[]; color: string; isYou: boolean }) {
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
  const best = scores.length > 0 ? Math.max(...scores) : null
  const perfect = scores.filter(s => s === 100).length

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: color }}>
          {displayName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm">{isYou ? 'You' : displayName}</p>
          <p className="text-xs text-muted">{scores.length} turns taken</p>
        </div>
        {avg !== null && (
          <div className="ml-auto text-right">
            <p className="font-playfair text-2xl font-black" style={{ color }}>{avg}%</p>
            <p className="text-xs text-muted">average</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-cream rounded-xl py-2">
          <p className="font-bold text-sm text-success">{best ?? '—'}%</p>
          <p className="text-xs text-muted">Best</p>
        </div>
        <div className="bg-cream rounded-xl py-2">
          <p className="font-bold text-sm text-accent">{avg ?? '—'}%</p>
          <p className="text-xs text-muted">Avg</p>
        </div>
        <div className="bg-cream rounded-xl py-2">
          <p className="font-bold text-sm text-accent2">{perfect}</p>
          <p className="text-xs text-muted">Perfect</p>
        </div>
      </div>
    </Card>
  )
}

function speak(text: string, lang: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang
  utt.rate = 0.85
  window.speechSynthesis.speak(utt)
}

export default function ResultsPage({ params }: { params: { roomId: string; convId: string } }) {
  const router = useRouter()
  const { token } = useAuth()
  const { getSpeechCode } = useMeta()
  const [conv, setConv] = useState<Conversation | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    if (!token) { router.push('/'); return }
    try {
      const p = JSON.parse(atob(token.split('.')[1]))
      setUserId(p.sub)
    } catch { /* ignore */ }
    api.conversations.get(params.roomId, params.convId).then(setConv).catch(() => {})
    api.rooms.get(params.roomId).then(setRoom).catch(() => {})
  }, [token, params.roomId, params.convId, router])

  if (!conv || !room) return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <div className="flex-1 flex items-center justify-center">
        <Spinner className="w-8 h-8 text-muted" />
      </div>
    </div>
  )

  // Build per-player score arrays
  const playerScores: Record<string, { name: string; scores: number[]; colorIdx: number }> = {}
  conv.participants
    .filter(p => !p.is_ai && p.user_id)
    .forEach((p, i) => {
      playerScores[p.user_id!] = { name: p.display_name ?? p.username ?? 'Player', scores: [], colorIdx: i }
    })

  for (const msg of conv.messages) {
    if (msg.response) {
      const uid = msg.response.user_id
      if (playerScores[uid]) playerScores[uid].scores.push(msg.response.score)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />
      <main className="max-w-2xl mx-auto w-full px-4 py-6">
        {/* Hero */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="font-playfair text-3xl font-black mb-1">Conversation Complete!</h2>
          <p className="text-muted text-sm">{conv.prompt}</p>
          <div className="flex gap-2 justify-center mt-2">
            <Badge color="default">{room.language}</Badge>
            <Badge color="warn">{room.level}</Badge>
          </div>
        </div>

        {/* Player summaries */}
        <div className="flex flex-col gap-3 mb-6">
          {Object.entries(playerScores).map(([uid, { name, scores, colorIdx }]) => (
            <PlayerSummary
              key={uid}
              displayName={name}
              scores={scores}
              color={PLAYER_COLORS[colorIdx % PLAYER_COLORS.length]}
              isYou={uid === userId}
            />
          ))}
        </div>

        {/* Turn-by-turn breakdown */}
        <h3 className="font-playfair text-xl font-bold mb-3">Turn by Turn</h3>
        <div className="flex flex-col gap-2 mb-8">
          {conv.messages.map(msg => {
            const participant = conv.participants.find(p => p.role === msg.speaker)
            const isAI = participant?.is_ai
            const isMe = participant?.user_id === userId
            const colorIdx = conv.participants.filter(p => !p.is_ai).findIndex(p => p.role === msg.speaker)
            const color = PLAYER_COLORS[colorIdx >= 0 ? colorIdx : 0]
            const name = isAI ? 'AI' : (isMe ? 'You' : (participant?.display_name ?? 'Player'))
            const isOpen = expanded === msg.turn_number

            return (
              <Card key={msg.turn_number} className="overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : msg.turn_number)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-cream/50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: color }}>
                    {msg.turn_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-muted">{name}</p>
                    <p className="text-sm truncate">{msg.native_text}</p>
                  </div>
                  {msg.response ? (
                    <span className={clsx('text-xs font-bold px-2 py-0.5 rounded-full border', SCORE_BG[msg.response.score_label])}>
                      <span className={SCORE_COLOR[msg.response.score_label]}>{msg.response.score}%</span>
                    </span>
                  ) : isAI ? (
                    <span className="text-xs text-muted">AI</span>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                  <span className="text-muted text-xs">{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border animate-fade-up">
                    <div className="grid grid-cols-1 gap-2 mt-3 text-sm">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-muted mb-1">Target</p>
                        <p className="font-medium">{msg.roman_text}</p>
                        {msg.native_text !== msg.roman_text && (
                          <p className="text-xs text-muted mt-0.5">{msg.native_text}</p>
                        )}
                        <p className="text-xs text-muted/70 mt-0.5 italic">{msg.english_text}</p>
                        <button
                          onClick={() => speak(msg.roman_text, getSpeechCode(room.language))}
                          className="text-xs text-accent2 hover:underline flex items-center gap-1 mt-1"
                        >
                          🔊 Listen
                        </button>
                      </div>
                      {msg.response && (
                        <>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-muted mb-1">Response</p>
                            <p>{msg.response.text}</p>
                          </div>
                          <div className={clsx('rounded-xl px-3 py-2 border text-xs', SCORE_BG[msg.response.score_label])}>
                            <p className={clsx('font-bold', SCORE_COLOR[msg.response.score_label])}>
                              {msg.response.score_label} · {msg.response.score}%
                            </p>
                            <p className="text-muted mt-0.5">{msg.response.score_breakdown}</p>
                          </div>
                          {msg.hint && (
                            <p className="text-xs text-muted bg-cream rounded-lg px-3 py-2">
                              💡 {msg.hint}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        <Button full onClick={() => router.push('/dashboard')}>
          ← Back to Dashboard
        </Button>
      </main>
    </div>
  )
}
