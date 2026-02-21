'use client'
import { Conversation, PLAYER_COLORS } from '@/types'

interface ScoreBarProps {
  conversation: Conversation
  currentUserId?: string
}

function computeAverages(conversation: Conversation): Record<string, { avg: number | null; display_name: string }> {
  const scores: Record<string, number[]> = {}
  const names: Record<string, string> = {}

  for (const p of conversation.participants) {
    if (!p.is_ai && p.user_id) {
      scores[p.user_id] = []
      names[p.user_id] = p.display_name ?? p.username ?? 'Player'
    }
  }

  for (const msg of conversation.messages) {
    if (msg.response && !conversation.participants.find(p => p.role === msg.speaker)?.is_ai) {
      const uid = msg.response.user_id
      if (scores[uid] !== undefined) scores[uid].push(msg.response.score)
    }
  }

  const result: Record<string, { avg: number | null; display_name: string }> = {}
  for (const [uid, sc] of Object.entries(scores)) {
    result[uid] = {
      avg: sc.length > 0 ? Math.round(sc.reduce((a, b) => a + b, 0) / sc.length) : null,
      display_name: names[uid],
    }
  }
  return result
}

export function ScoreBar({ conversation, currentUserId }: ScoreBarProps) {
  const averages = computeAverages(conversation)
  const entries = Object.entries(averages)
  if (entries.length === 0) return null

  return (
    <div className="bg-white border-b border-border px-4 py-2 flex gap-4 items-center overflow-x-auto flex-shrink-0">
      <span className="text-xs font-bold uppercase tracking-wide text-muted flex-shrink-0">Score</span>
      {entries.map(([uid, { avg, display_name }], i) => {
        const color = PLAYER_COLORS[i % PLAYER_COLORS.length]
        const isYou = uid === currentUserId
        return (
          <div key={uid} className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: color }}
            >
              {display_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-muted font-medium leading-none mb-0.5">
                {isYou ? 'You' : display_name}
              </p>
              <p className="font-playfair font-bold text-lg leading-none" style={{ color }}>
                {avg !== null ? `${avg}%` : '—'}
              </p>
            </div>
          </div>
        )
      })}
      <div className="ml-auto flex-shrink-0">
        <span className="text-xs text-muted">
          Turn{' '}
          <strong>{Math.min(conversation.current_turn - 1, 20)}</strong>
          /20
        </span>
      </div>
    </div>
  )
}
