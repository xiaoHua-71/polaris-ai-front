export interface HelloResponse {
  app: string
  message: string
}

export interface ChatRequest {
  message: string
}

export interface ChatResponse {
  content: string
}

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
}
