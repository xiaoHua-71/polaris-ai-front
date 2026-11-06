import { apiClient } from '@/api/client'
import type { ChatRequest, ChatResponse, HelloResponse } from '@/types/api'

export async function fetchHello(): Promise<HelloResponse> {
  const { data } = await apiClient.get<HelloResponse>('/hello')
  return data
}

export async function postChat(payload: ChatRequest): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>('/chat', payload)
  return data
}
