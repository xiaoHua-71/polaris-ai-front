import { create } from 'zustand'
import { postChat } from '@/api/chat'
import { toErrorMessage } from '@/api/client'
import type { ChatMessage, ChatRole } from '@/types/api'

let messageSeq = 0

function createMessage(role: ChatRole, content: string): ChatMessage {
  messageSeq += 1
  return {
    id: `${role}-${messageSeq}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  }
}

interface ChatState {
  messages: ChatMessage[]
  sending: boolean
  error: string | null
  send: (content: string) => Promise<void>
  clear: () => void
  dismissError: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  sending: false,
  error: null,
  send: async (content) => {
    const text = content.trim()
    if (!text || get().sending) return

    set((state) => ({
      messages: [...state.messages, createMessage('user', text)],
      sending: true,
      error: null,
    }))

    try {
      const reply = await postChat({ message: text })
      set((state) => ({
        messages: [...state.messages, createMessage('assistant', reply.content)],
        sending: false,
      }))
    } catch (error) {
      set({ sending: false, error: toErrorMessage(error) })
    }
  },
  clear: () => set({ messages: [], error: null }),
  dismissError: () => set({ error: null }),
}))
