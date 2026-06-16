export type ChatRole = 'user' | 'assistant' | 'tool'

export type ChatMessageStatus = 'pending' | 'streaming' | 'complete' | 'failed'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  status: ChatMessageStatus
  toolName?: string
  createdAt: string
}

export interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface SendMessageRequest {
  content: string
}

export type SseEvent =
  | { kind: 'delta'; text: string }
  | { kind: 'error'; message: string }
  | { kind: 'done' }
