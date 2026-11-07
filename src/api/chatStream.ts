import { ApiError } from '@/api/client'
import type {
  ChatRequest,
  ChatStreamDelta,
  ChatStreamDone,
  ChatStreamError,
} from '@/types/api'

export interface ChatStreamHandlers {
  onDelta: (content: string) => void
  onDone: (conversationId: string) => void
  onError: (message: string) => void
}

type StreamEvent = 'delta' | 'done' | 'error'

export async function postChatStream(
  payload: ChatRequest,
  handlers: ChatStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  let response: Response
  try {
    response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(payload),
      signal,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new ApiError('无法连接后端服务，请确认 http://localhost:8103 已启动')
  }

  if (!response.ok) {
    throw new ApiError(`请求失败（HTTP ${response.status}）`, response.status)
  }
  if (!response.body) {
    throw new ApiError('当前浏览器不支持流式响应')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let sawDone = false
  let sawError = false

  const dispatch = (frame: string) => {
    const eventData = parseFrame(frame)
    if (!eventData || signal?.aborted) return
    const { event, data } = eventData
    if (event === 'delta') {
      handlers.onDelta((JSON.parse(data) as ChatStreamDelta).content)
    } else if (event === 'done') {
      handlers.onDone((JSON.parse(data) as ChatStreamDone).conversationId)
      sawDone = true
    } else if (event === 'error') {
      handlers.onError((JSON.parse(data) as ChatStreamError).message)
      sawError = true
    }
  }

  const consumeFrames = () => {
    buffer = buffer.replace(/\r\n/g, '\n')
    let boundary = buffer.indexOf('\n\n')
    while (boundary >= 0) {
      dispatch(buffer.slice(0, boundary))
      buffer = buffer.slice(boundary + 2)
      boundary = buffer.indexOf('\n\n')
    }
  }

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      consumeFrames()
    }
    buffer += decoder.decode()
    consumeFrames()
    if (buffer.trim()) dispatch(buffer)
  } catch (error) {
    if (signal?.aborted) throw error
    if (error instanceof ApiError) throw error
    throw new ApiError('连接中断，回答可能不完整')
  } finally {
    reader.releaseLock()
  }

  if (!signal?.aborted && !sawDone && !sawError) {
    throw new ApiError('连接中断，回答可能不完整')
  }
}

function parseFrame(frame: string): { event: StreamEvent | string; data: string } | null {
  let event = 'message'
  const dataLines: string[] = []

  for (const line of frame.split('\n')) {
    if (!line || line.startsWith(':')) continue
    const colon = line.indexOf(':')
    const field = colon >= 0 ? line.slice(0, colon) : line
    let value = colon >= 0 ? line.slice(colon + 1) : ''
    if (value.startsWith(' ')) value = value.slice(1)
    if (field === 'event') event = value
    else if (field === 'data') dataLines.push(value)
  }

  return dataLines.length ? { event, data: dataLines.join('\n') } : null
}
