'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { usePolling } from '@/hooks/usePolling'
import { api } from '@/lib/api'
import { Conversation, Room, TextMode, InputMode, Language } from '@/types'
import { MessageBubble } from '@/components/conversation/MessageBubble'
import { PromptCard } from '@/components/conversation/PromptCard'
import { ScoreBar } from '@/components/conversation/ScoreBar'
import { PillToggle, Spinner } from '@/components/ui'

export default function ConversationPage({
  params,
}: {
  params: { roomId: string; convId: string }
}) {
  const router = useRouter()
  const { token } = useAuth()
  const [conv, setConv] = useState<Conversation | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [textMode, setTextMode] = useState<TextMode>('roman')
  const [inputMode, setInputMode] = useState<InputMode>('roman')
  const [submitting, setSubmitting] = useState(false)
  const [aiTyping, setAiTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const prevTurnRef = useRef<number>(0)

  // Restore preferences
  useEffect(() => {
    if (!token) { router.push('/'); return }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUserId(payload.sub)
    } catch { /* ignore */ }
    const saved = localStorage.getItem('lt_textmode') as TextMode | null
    if (saved) setTextMode(saved)
    const savedInput = localStorage.getItem('lt_inputmode') as InputMode | null
    if (savedInput) setInputMode(savedInput)
  }, [token, router])

  const fetchConv = useCallback(async () => {
    try {
      const data = await api.conversations.get(params.roomId, params.convId)
      setConv(prev => {
        // If turn advanced and current turn belongs to AI, show typing animation
        if (prev && data.current_turn > prev.current_turn) {
          const turn = data.messages.find(m => m.turn_number === data.current_turn)
          const isAI = data.participants.find(p => p.role === turn?.speaker)?.is_ai
          if (isAI && data.status !== 'completed') {
            setAiTyping(true)
            setTimeout(() => setAiTyping(false), 1800)
          }
        }
        return data
      })
    } catch { /* silent */ }
  }, [params.roomId, params.convId])

  useEffect(() => {
    fetchConv()
    api.rooms.get(params.roomId).then(setRoom).catch(() => {})
  }, [fetchConv, params.roomId])

  // Poll only while conversation is active
  usePolling(fetchConv, 2500, conv?.status === 'active')

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (conv && conv.current_turn !== prevTurnRef.current) {
      prevTurnRef.current = conv.current_turn
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [conv?.current_turn])

  function saveTextMode(m: TextMode) {
    setTextMode(m)
    localStorage.setItem('lt_textmode', m)
  }

  function saveInputMode(m: InputMode) {
    setInputMode(m)
    localStorage.setItem('lt_inputmode', m)
  }

  async function handleSubmit(text: string) {
    if (!conv || submitting) return
    setSubmitting(true)
    try {
      const updated = await api.conversations.submitTurn(
        params.roomId, params.convId, conv.current_turn, text, inputMode,
      )
      setConv(updated)
      if (updated.status === 'completed') {
        setTimeout(() => router.push(`/rooms/${params.roomId}/conversation/${params.convId}/results`), 1200)
      }
    } catch { /* silent */ }
    finally { setSubmitting(false) }
  }

  if (!conv || !room) return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="bg-ink text-cream px-5 py-3 flex items-center gap-3">
        <span className="font-playfair text-xl font-black">Babel<span className="text-accent">Bridge</span></span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Spinner className="w-8 h-8 text-muted" />
      </div>
    </div>
  )

  const currentTurnMsg = conv.messages.find(m => m.turn_number === conv.current_turn)
  const currentParticipant = currentTurnMsg
    ? conv.participants.find(p => p.role === currentTurnMsg.speaker)
    : null
  const isMyTurn = currentParticipant?.user_id === userId && !currentParticipant?.is_ai
  const isDone = conv.status === 'completed'

  // Map participant user_id → index for color
  const participantColorMap: Record<string, number> = {}
  conv.participants.filter(p => !p.is_ai).forEach((p, i) => {
    if (p.user_id) participantColorMap[p.user_id] = i
  })

  return (
    <div className="min-h-screen flex flex-col" style={{ height: '100dvh' }}>
      {/* Header */}
      <header className="bg-ink text-cream px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => router.push('/dashboard')} className="text-cream/40 hover:text-cream transition-colors text-lg">←</button>
        <div className="flex-1 min-w-0">
          <h2 className="font-playfair text-base font-bold truncate">{conv.prompt}</h2>
          <p className="text-cream/40 text-xs">{room.language} · {room.level}</p>
        </div>
        {/* Text display toggle */}
        <div className="w-48 flex-shrink-0">
          <PillToggle
            options={[
              { value: 'roman' as TextMode, label: 'ABC' },
              { value: 'native' as TextMode, label: '文' },
              { value: 'english' as TextMode, label: 'EN' },
            ]}
            value={textMode}
            onChange={saveTextMode}
          />
        </div>
      </header>

      {/* Score bar */}
      <ScoreBar conversation={conv} currentUserId={userId ?? undefined} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <div className="text-center text-xs text-muted py-1">
          Conversation started · {room.language} · {room.level}
        </div>

        {conv.messages.map(msg => {
          const participant = conv.participants.find(p => p.role === msg.speaker)
          const isAI = participant?.is_ai ?? false
          const isMe = participant?.user_id === userId
          const playerIndex = isMe
            ? participantColorMap[userId!] ?? 0
            : participantColorMap[participant?.user_id ?? ''] ?? 1

          // Skip future unresponded turns silently
          if (!msg.response && msg.turn_number > conv.current_turn) return null
          // Skip current AI turn if it hasn't been displayed yet (handled by aiTyping)
          if (isAI && msg.turn_number === conv.current_turn && !msg.response) return null

          return (
            <MessageBubble
              key={msg.turn_number}
              message={msg}
              isMe={isMe}
              isAI={isAI}
              participant={participant}
              textMode={textMode}
              language={room.language as Language}
              playerIndex={playerIndex}
            />
          )
        })}

        {/* AI typing indicator */}
        {aiTyping && currentTurnMsg && (
          <MessageBubble
            message={currentTurnMsg}
            isMe={false}
            isAI={true}
            textMode={textMode}
            language={room.language as Language}
            playerIndex={0}
            showTyping={true}
          />
        )}

        {/* Completion */}
        {isDone && (
          <div className="text-center py-6 animate-fade-up">
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-playfair text-xl font-bold text-ink mb-1">Conversation complete!</p>
            <p className="text-muted text-sm">Loading your results…</p>
          </div>
        )}

        {/* Waiting for other player */}
        {!isDone && !isMyTurn && currentTurnMsg && !currentParticipant?.is_ai && (
          <div className="text-center text-sm text-muted py-2">
            Waiting for <strong>{currentParticipant?.display_name ?? 'player'}</strong>…
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt card — shown on your turn */}
      {isMyTurn && currentTurnMsg && !isDone && (
        <PromptCard
          message={currentTurnMsg}
          language={room.language as Language}
          inputMode={inputMode}
          onInputModeChange={saveInputMode}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {/* Bottom bar when waiting */}
      {!isMyTurn && !isDone && (
        <div className="bg-white border-t border-border px-4 py-3 flex-shrink-0 text-center">
          <p className="text-sm text-muted">
            {currentParticipant?.is_ai
              ? 'AI is typing…'
              : `Waiting for ${currentParticipant?.display_name ?? 'player'}…`}
          </p>
        </div>
      )}
    </div>
  )
}
