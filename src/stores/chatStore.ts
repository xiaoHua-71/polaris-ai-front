import { create } from 'zustand'
import { postChatStream } from '@/api/chatStream'
import { toErrorMessage } from '@/api/client'
import type { ChatMessage, ChatRole } from '@/types/api'

const STORAGE_KEY = 'polaris-ai-chat'
let messageSeq = 0
let activeAbort: AbortController | null = null

interface PersistedChat {
  conversationId: string
  messages: ChatMessage[]
}

function newConversationId(): string {
  return crypto.randomUUID()
}

function readPersistedChat(): PersistedChat {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value) {
      const parsed = JSON.parse(value) as Partial<PersistedChat>
      if (typeof parsed.conversationId === 'string' && Array.isArray(parsed.messages)) {
        return { conversationId: parsed.conversationId, messages: parsed.messages }
      }
    }
  } catch {
    // Ignore unavailable storage or invalid persisted data.
  }
  return { conversationId: newConversationId(), messages: [] }
}

function persistChat(conversationId: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversationId, messages }))
  } catch {
    // Chat remains usable when storage is unavailable or full.
  }
}

function createMessage(role: ChatRole, content: string): ChatMessage {
  messageSeq += 1
  return {
    id: `${role}-${Date.now()}-${messageSeq}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  }
}

interface ChatState {
  conversationId: string
  messages: ChatMessage[]
  sending: boolean
  error: string | null
  send: (content: string) => Promise<void>
  stop: () => void
  newConversation: () => void
  dismissError: () => void
}

const initialChat = readPersistedChat()

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialChat,
  sending: false,
  error: null,
  send: async (content) => {
    const text = content.trim()
    if (!text || get().sending) return

    const { conversationId } = get()
    const userMessage = createMessage('user', text)
    const assistantMessage = createMessage('assistant', '')
    set((state) => ({
      messages: [...state.messages, userMessage, assistantMessage],
      sending: true,
      error: null,
    }))

    const abort = new AbortController()
    activeAbort = abort
    try {
      await postChatStream(
        { message: text, conversationId },
        {
          onDelta: (chunk) => {
            if (abort.signal.aborted) return
            set((state) => ({
              messages: state.messages.map((message) =>
                message.id === assistantMessage.id
                  ? { ...message, content: message.content + chunk }
                  : message,
              ),
            }))
          },
          onDone: () => {},
          onError: (message) => {
            if (!abort.signal.aborted) set({ error: message })
          },
        },
        abort.signal,
      )
    } catch (error) {
      if (!abort.signal.aborted) set({ error: toErrorMessage(error) })
    } finally {
      if (activeAbort === abort) {
        const currentMessages = get().messages.filter(
          (message) => message.id !== assistantMessage.id || message.content !== '',
        )
        set({ messages: currentMessages, sending: false })
        persistChat(get().conversationId, currentMessages)
        activeAbort = null
      }
    }
  },
  stop: () => {
    activeAbort?.abort()
  },
  newConversation: () => {
    activeAbort?.abort()
    activeAbort = null
    const conversationId = newConversationId()
    set({ conversationId, messages: [], sending: false, error: null })
    persistChat(conversationId, [])
  },
  dismissError: () => set({ error: null }),
}))
