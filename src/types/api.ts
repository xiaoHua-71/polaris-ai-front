export interface HelloResponse {
  app: string
  message: string
}

export interface ChatRequest {
  message: string
  conversationId: string
}

export interface ChatResponse {
  content: string
}

export interface ChatStreamDelta {
  content: string
}

export interface ChatStreamDone {
  conversationId: string
}

export interface ChatStreamError {
  message: string
}

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
}
