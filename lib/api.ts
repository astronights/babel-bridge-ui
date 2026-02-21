const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('lt_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }
  // 204 No Content
  if (res.status === 204) return undefined as T
  return res.json()
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    register: (username: string, password: string) =>
      request<{ access_token: string; username: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    login: (username: string, password: string) =>
      request<{ access_token: string; username: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
  },

  // ── Meta ───────────────────────────────────────────────────────────────────
  meta: {
    get: () => request<import('@/types').MetaResponse>('/meta'),
  },

  // ── Rooms ──────────────────────────────────────────────────────────────────
  rooms: {
    list: () => request<import('@/types').Room[]>('/rooms'),
    get: (id: string) => request<import('@/types').Room>(`/rooms/${id}`),
    create: (body: {
      language: string
      level: string
      max_players: number
      display_name: string
    }) => request<import('@/types').Room>('/rooms', { method: 'POST', body: JSON.stringify(body) }),
    join: (join_code: string, display_name: string) =>
      request<import('@/types').Room>('/rooms/join', {
        method: 'POST',
        body: JSON.stringify({ join_code, display_name }),
      }),
  },

  // ── Conversations ──────────────────────────────────────────────────────────
  conversations: {
    list: (roomId: string) =>
      request<import('@/types').Conversation[]>(`/rooms/${roomId}/conversations`),
    get: (roomId: string, convId: string) =>
      request<import('@/types').Conversation>(`/rooms/${roomId}/conversations/${convId}`),
    create: (roomId: string, prompt?: string, maxTurns?: number) =>
      request<import('@/types').Conversation>(`/rooms/${roomId}/conversations`, {
        method: 'POST',
        body: JSON.stringify({ prompt: prompt ?? null, max_turns: maxTurns }),
      }),
    submitTurn: (
      roomId: string,
      convId: string,
      turnNumber: number,
      text: string,
      input_mode: 'roman' | 'native',
    ) =>
      request<import('@/types').Conversation>(
        `/rooms/${roomId}/conversations/${convId}/turns/${turnNumber}`,
        { method: 'POST', body: JSON.stringify({ text, input_mode }) },
      ),
  },
}
