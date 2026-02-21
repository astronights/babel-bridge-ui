export type Language = 'Russian' | 'Chinese' | 'Swedish'
export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type RoomStatus = 'waiting' | 'active' | 'completed'
export type ConversationStatus = 'active' | 'completed'
export type Role = 'A' | 'B' | 'C' | 'D'
export type InputMode = 'roman' | 'native'
export type TextMode = 'roman' | 'native' | 'english'

export interface Member {
  user_id: string
  username: string
  display_name: string
  joined_at: string
}

export interface Participant {
  user_id?: string
  username?: string
  display_name?: string
  role: Role
  is_ai: boolean
}

export interface Response {
  user_id: string
  display_name: string
  text: string
  input_mode: InputMode
  score: number
  score_label: string
  score_breakdown: string
  submitted_at: string
}

export interface Message {
  turn_number: number
  speaker: Role
  roman_text: string
  native_text: string
  english_text: string
  hint: string
  response: Response | null
}

export interface Room {
  id: string
  language: Language
  level: Level
  max_players: number
  join_code: string
  status: RoomStatus
  created_by: string
  created_at: string
  members: Member[]
}

export interface Conversation {
  id: string
  room_id: string
  prompt: string
  status: ConversationStatus
  current_turn: number
  created_at: string
  participants: Participant[]
  messages: Message[]
}

export interface TokenResponse {
  access_token: string
  token_type: string
  username: string
}

export interface MetaResponse {
  languages: Language[]
  levels: Level[]
}

// Score color helpers
export const SCORE_COLOR: Record<string, string> = {
  'Perfect!': 'text-success',
  'Excellent': 'text-success',
  'Great': 'text-accent2',
  'Almost there': 'text-gold',
  'Partial match': 'text-orange-500',
  'Keep practising': 'text-red-500',
}

export const SCORE_BG: Record<string, string> = {
  'Perfect!': 'bg-success/10 border-success/25',
  'Excellent': 'bg-success/10 border-success/25',
  'Great': 'bg-accent2/10 border-accent2/25',
  'Almost there': 'bg-gold/10 border-gold/25',
  'Partial match': 'bg-orange-500/10 border-orange-500/25',
  'Keep practising': 'bg-red-500/10 border-red-500/25',
}

export const PLAYER_COLORS = [
  '#e8643a', '#4a9eff', '#3dba7e', '#d4a843', '#9b59b6',
]

export const LANG_SPEECH: Record<Language, string> = {
  Russian: 'ru-RU',
  Chinese: 'zh-CN',
  Swedish: 'sv-SE',
}
