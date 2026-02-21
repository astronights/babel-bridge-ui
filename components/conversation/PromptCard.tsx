'use client'
import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import { Message, InputMode } from '@/types'
import { Button, PillToggle } from '@/components/ui'

interface PromptCardProps {
  message: Message
  speechCode: string
  romanSymbol: string
  nativeSymbol: string
  displayName: string
  inputMode: InputMode
  onInputModeChange: (m: InputMode) => void
  onSubmit: (text: string) => Promise<void>
  submitting: boolean
}

function speak(text: string, lang: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang
  utt.rate = 0.85
  window.speechSynthesis.speak(utt)
}

export function PromptCard({
  message, speechCode, romanSymbol, nativeSymbol, displayName, inputMode, onInputModeChange, onSubmit, submitting,
}: PromptCardProps) {
  const [text, setText] = useState('')
  const [showHint, setShowHint] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { taRef.current?.focus() }, [])

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  async function handleSubmit() {
    if (!text.trim() || submitting) return
    await onSubmit(text.trim())
    setText('')
  }

  return (
    <div className="mx-4 mb-3 bg-white border-2 border-accent rounded-2xl p-4 flex-shrink-0 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-accent uppercase tracking-wide">🎯 Your turn</p>
        {/* Input mode toggle — hidden for Swedish since roman = native */}
        <PillToggle
          options={[
            { value: 'roman' as InputMode, label: romanSymbol.toUpperCase() },
            { value: 'native' as InputMode, label: nativeSymbol },
          ]}
          value={inputMode}
          onChange={onInputModeChange}
        />
      </div>

      {/* English prompt — the challenge */}
      <p className="text-base font-semibold text-ink mb-1">{message.english_text}</p>

      {/* Hint toggle */}
      {message.hint && (
        <button
          onClick={() => setShowHint(h => !h)}
          className="text-xs text-muted hover:text-ink transition-colors mb-2 flex items-center gap-1"
        >
          💡 {showHint ? 'Hide hint' : 'Show hint'}
        </button>
      )}
      {showHint && (
        <p className="text-xs text-muted bg-cream rounded-lg px-3 py-2 mb-3 leading-relaxed">
          {message.hint}
        </p>
      )}

      {/* Listen to the target */}
      <button
        onClick={() => speak(message.roman_text, speechCode)}
        className="text-xs text-accent2 hover:underline flex items-center gap-1 mb-3"
      >
        🔊 Hear the line
      </button>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea
          ref={taRef}
          value={text}
          onChange={e => { setText(e.target.value); autoResize(e.target) }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
          }}
          rows={1}
          placeholder={
            inputMode === 'native'
              ? `Type in ${displayName} script…`
              : `Type in romanised ${displayName}…`
          }
          className={clsx(
            'flex-1 resize-none px-3 py-2.5 border-[1.5px] rounded-xl text-sm font-dm',
            'bg-cream text-ink outline-none transition-colors min-h-[42px] max-h-[120px]',
            'border-border focus:border-accent',
          )}
        />
        <Button onClick={handleSubmit} loading={submitting} disabled={!text.trim()} size="sm">
          Send
        </Button>
      </div>
    </div>
  )
}
