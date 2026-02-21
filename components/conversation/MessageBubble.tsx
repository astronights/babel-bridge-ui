'use client'
import { clsx } from 'clsx'
import { Message, Participant, TextMode, SCORE_COLOR, SCORE_BG, LANG_SPEECH, Language, PLAYER_COLORS } from '@/types'
import { diffWords } from '@/lib/diff'
import { TypingDots } from '@/components/ui'

interface BubbleProps {
  message: Message
  isMe: boolean
  isAI: boolean
  participant?: Participant
  textMode: TextMode
  language: Language
  playerIndex: number
  showTyping?: boolean   // AI typing animation
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

// Diff rendered as colored words
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
  message, isMe, isAI, participant, textMode, language, playerIndex, showTyping,
}: BubbleProps) {
  const color = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length]
  const speechLang = LANG_SPEECH[language]
  const displayName = isAI ? 'AI' : (participant?.display_name ?? 'Player')
  const hasResponse = !!message.response

  // AI bubble with typing animation
  if (isAI && showTyping) {
    return (
      <div className="flex flex-col items-center gap-1 animate-fade-up">
        <span className="text-xs font-semibold text-muted">AI</span>
        <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3">
          <TypingDots />
        </div>
      </div>
    )
  }

  // AI turn — always shown, no response needed
  if (isAI) {
    return (
      <div className="flex flex-col items-start gap-1 max-w-[80%] animate-fade-up">
        <span className="text-xs font-semibold px-1" style={{ color }}>AI</span>
        <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed">
          {getDisplayText(message, textMode)}
        </div>
        <button
          onClick={() => speak(message.roman_text, speechLang)}
          className="text-xs text-accent2 hover:underline flex items-center gap-1 px-1"
        >
          🔊 Listen
        </button>
      </div>
    )
  }

  return (
    <div className={clsx(
      'flex flex-col gap-1 max-w-[82%] animate-fade-up',
      isMe ? 'self-end items-end' : 'self-start items-start',
    )}>
      {/* Sender name */}
      {hasResponse && (
        <span className="text-xs font-semibold px-1" style={{ color }}>
          {isMe ? 'You' : displayName}
        </span>
      )}

      {/* Pre-response: show target text in bubble */}
      {/* {!hasResponse && (
        <div className={clsx(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isMe
            ? 'bg-accent/10 border border-accent/20 text-ink rounded-br-sm'
            : 'bg-white border border-border text-ink rounded-bl-sm',
        )}>
          {getDisplayText(message, textMode)}
        </div>
      )} */}

      {/* For other users — always show clean target line regardless of response */}
      {!isMe && (
        <div className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-white border border-border text-ink">
          {getDisplayText(message, textMode)}
        </div>
      )}

      {/* Post-response reveal */}
      {hasResponse && (
        <div className={clsx(
          'flex flex-col gap-2 px-4 py-3 rounded-2xl text-sm',
          isMe
            ? 'bg-accent text-white rounded-br-sm'
            : 'bg-white border border-border text-ink rounded-bl-sm',
        )}>
          {/* What they typed — with diff */}
          {isMe && (
            <div>
              <p className={clsx('text-xs font-bold mb-1 uppercase tracking-wide', isMe ? 'text-white/60' : 'text-muted')}>
                You typed
              </p>
              <p className="font-medium">
                <DiffText input={message.response!.text} target={
                  message.response!.input_mode === 'native' ? message.native_text : message.roman_text
                } />
              </p>
            </div>
          )}

          {/* Target reveal */}
          {isMe && (
            <div className={clsx('border-t pt-2', isMe ? 'border-white/20' : 'border-border')}>
              <p className={clsx('text-xs font-bold mb-1 uppercase tracking-wide', isMe ? 'text-white/60' : 'text-muted')}>
                Target
              </p>
              <p className="font-medium">{message.roman_text}</p>
              {message.native_text !== message.roman_text && (
                <p className={clsx('text-xs mt-0.5', isMe ? 'text-white/70' : 'text-muted')}>
                  {message.native_text}
                </p>
              )}
              <p className={clsx('text-xs mt-0.5', isMe ? 'text-white/60' : 'text-muted/70')}>
                {message.english_text}
              </p>
            </div>
          )}

          {/* Score */}
          <div className={clsx(
            'rounded-xl px-3 py-2 border text-xs',
            isMe ? 'bg-white/10 border-white/20' : SCORE_BG[message.response!.score_label] ?? 'bg-border/30 border-border',
          )}>
            <p className={clsx('font-bold', isMe ? 'text-white' : SCORE_COLOR[message.response!.score_label])}>
              {message.response!.score_label} · {message.response!.score}%
            </p>
            <p className={clsx(isMe ? 'text-white/60' : 'text-muted', 'mt-0.5')}>
              {message.response!.score_breakdown}
            </p>
          </div>
        </div>
      )}

      {/* Listen button */}
      {hasResponse && (
        <button
          onClick={() => speak(message.roman_text, speechLang)}
          className="text-xs text-accent2 hover:underline flex items-center gap-1 px-1"
        >
          🔊 Listen
        </button>
      )}
    </div>
  )
}
