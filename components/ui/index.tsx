'use client'
import { clsx } from 'clsx'
import { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react'

// ── Button ───────────────────────────────────────────────────────────────────
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  loading?: boolean
  full?: boolean
}

export function Button({
  variant = 'primary', size = 'md', loading, full, className, children, disabled, ...props
}: BtnProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-xl border transition-all font-dm',
        size === 'md' ? 'px-5 py-2.5 text-sm' : 'px-3 py-1.5 text-xs',
        variant === 'primary' && 'bg-accent text-white border-accent hover:bg-orange-600 hover:-translate-y-0.5',
        variant === 'secondary' && 'bg-transparent text-ink border-border hover:border-ink',
        variant === 'ghost' && 'bg-transparent text-muted border-transparent hover:text-ink',
        full && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed translate-y-0',
        className,
      )}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

// ── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}
export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-bold uppercase tracking-wide text-muted">{label}</label>}
      <input
        className={clsx(
          'w-full px-4 py-2.5 border-[1.5px] rounded-xl font-dm text-sm text-ink bg-cream outline-none transition-colors',
          error ? 'border-red-400' : 'border-border focus:border-accent',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}
export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-bold uppercase tracking-wide text-muted">{label}</label>}
      <select
        className={clsx(
          'w-full px-4 py-2.5 border-[1.5px] border-border rounded-xl font-dm text-sm text-ink bg-cream outline-none focus:border-accent transition-colors',
          className,
        )}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx('bg-white border border-border rounded-2xl shadow-sm', className)}>
      {children}
    </div>
  )
}

// ── Alert ────────────────────────────────────────────────────────────────────
export function Alert({ message, variant = 'error' }: { message: string; variant?: 'error' | 'info' }) {
  return (
    <div className={clsx(
      'px-4 py-3 rounded-xl text-sm border',
      variant === 'error' && 'bg-red-50 border-red-200 text-red-700',
      variant === 'info' && 'bg-blue-50 border-blue-200 text-blue-700',
    )}>
      {message}
    </div>
  )
}

// ── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ className }: { className?: string }) {
  return (
    <span className={clsx(
      'inline-block rounded-full border-2 border-current border-t-transparent animate-spin',
      className ?? 'w-4 h-4',
    )} />
  )
}

// ── Badge ────────────────────────────────────────────────────────────────────
export function Badge({
  children, color = 'default',
}: { children: React.ReactNode; color?: 'default' | 'success' | 'warn' | 'muted' }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold',
      color === 'default' && 'bg-accent/10 text-accent',
      color === 'success' && 'bg-success/10 text-success',
      color === 'warn' && 'bg-gold/10 text-gold',
      color === 'muted' && 'bg-border text-muted',
    )}>
      {children}
    </span>
  )
}

// ── Pill toggle (Roman / Native / English) ────────────────────────────────────
export function PillToggle<T extends string>({
  options, value, onChange,
}: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex border border-border rounded-xl overflow-hidden">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            'flex-1 py-1.5 text-xs font-semibold transition-all',
            value === o.value ? 'bg-ink text-cream' : 'text-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Typing dots ───────────────────────────────────────────────────────────────
export function TypingDots() {
  return (
    <span className="inline-flex gap-0.5 items-center h-4">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted"
          style={{ animation: `blink 1.4s ${i * 0.2}s infinite` }}
        />
      ))}
    </span>
  )
}
