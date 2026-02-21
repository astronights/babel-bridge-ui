'use client'
import { clsx } from 'clsx'
import { Message, Participant, TextMode, SCORE_COLOR, SCORE_BG, PLAYER_COLORS } from '@/types'
import { diffWords } from '@/lib/diff'
import { TypingDots } from '@/components/ui'

interface BubbleProps {
  message: Message
  isMe: boolean
  isAI: boolean
  participant?: Participant
  textMode: TextMode
  speechCode: string
  playerIndex: number
  showTyping?: boolean
}

function getDisplayText(msg: Message, mode: TextMode): string {
  if (mode === 'english') return msg.english_text
  if (mode === 'native') return msg.native_text
  return msg.roman_text
}

function speak(text: string, lang: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang
  utt.rate = 0.85
  window.speechSynthesis.speak(utt)
}

function DiffText({ input, target }: { input: string; target: string }) {
  const tokens = diffWords(input, target)
  return (
    <span>
      {tokens.map((t, i) => (
        <span key={i} className={clsx(
          'mr-1',
          t.correct ? 'text-success' : 'text-red-500 underline decoration-dotted',
        )}>
          {t.word}
        </span>
      ))}
    </span>
  )
}

export function MessageBubble({
  message, isMe, isAI, participant, textMode, speechCode, playerIndex, showTyping,
}: BubbleProps) {
  const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length]
  const displayName = isAI ? 'AI' : (participant?.display_name ?? 'Player')
  const hasResponse = !!message.response

  // ── AI typing animation ──────────────────────────────────────────────────
  if (isAI && showTyping) {
    return (
      <div className="flex flex-col items-start gap-1 animate-fade-up">
        <span className="text-xs font-semibold text-muted px-1">AI</span>
        <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3">
          <TypingDots />
        </div>
      </div>
    )
  }

  // ── AI turn (responded) ──────────────────────────────────────────────────
  if (isAI) {
    return (
      <div className="flex flex-col items-start gap-1 max-w-[80%] animate-fade-up">
        <span className="text-xs font-semibold px-1" style={{ color }}>AI</span>
        <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed">
          {getDisplayText(message, textMode)}
        </div>
        <button
          onClick={() => speak(message.roman_text, speechCode)}
          className="text-xs text-accent2 hover:underline flex items-center gap-1 px-1"
        >
          🔊 Listen
        </button>
      </div>
    )
  }

  // ── Other player's bubble ────────────────────────────────────────────────
  // Always shows clean target text — no score, no diff
  if (!isMe) {
    if (!hasResponse) return null
    return (
      <div className="flex flex-col items-start gap-1 max-w-[82%] animate-fade-up">
        <span className="text-xs font-semibold px-1" style={{ color }}>{displayName}</span>
        <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed">
          {getDisplayText(message, textMode)}
        </div>
        <button
          onClick={() => speak(message.roman_text, speechCode)}
          className="text-xs text-accent2 hover:underline flex items-center gap-1 px-1"
        >
          🔊 Listen
        </button>
      </div>
    )
  }

  // ── My bubble — full reveal with diff and score ──────────────────────────
  if (!hasResponse) return null
  return (
    <div className="flex flex-col items-end gap-1 max-w-[82%] self-end animate-fade-up">
      <span className="text-xs font-semibold px-1" style={{ color }}>You</span>

      <div className="flex flex-col gap-2 px-4 py-3 rounded-2xl rounded-br-sm text-sm bg-accent text-white">

        {/* What you typed — with diff */}
        <div>
          <p className="text-xs font-bold mb-1 uppercase tracking-wide text-white/60">You typed</p>
          <p className="font-medium">
            <DiffText
              input={message.response!.text}
              target={message.response!.input_mode === 'native' ? message.native_text : message.roman_text}
            />
          </p>
        </div>

        {/* Target reveal */}
        <div className="border-t border-white/20 pt-2">
          <p className="text-xs font-bold mb-1 uppercase tracking-wide text-white/60">Target</p>
          <p className="font-medium">{message.roman_text}</p>
          {message.native_text !== message.roman_text && (
            <p className="text-xs mt-0.5 text-white/70">{message.native_text}</p>
          )}
          <p className="text-xs mt-0.5 text-white/60 italic">{message.english_text}</p>
        </div>

        {/* Score */}
        <div className="rounded-xl px-3 py-2 border text-xs bg-white/10 border-white/20">
          <p className="font-bold text-white">
            {message.response!.score_label} · {message.response!.score}%
          </p>
          <p className="text-white/60 mt-0.5">{message.response!.score_breakdown}</p>
        </div>
      </div>

      {/* Listen */}
      <button
        onClick={() => speak(message.roman_text, speechCode)}
        className="text-xs text-accent2 hover:underline flex items-center gap-1 px-1"
      >
        🔊 Listen
      </button>
    </div>
  )
}