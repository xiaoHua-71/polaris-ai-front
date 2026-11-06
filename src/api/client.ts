import axios from 'axios'

export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
})

function extractMessage(data: unknown): string | null {
  if (typeof data === 'string' && data.trim()) return data
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    for (const key of ['message', 'error', 'detail']) {
      const value = record[key]
      if (typeof value === 'string' && value.trim()) return value
    }
  }
  return null
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status: number | undefined = error.response?.status
    const detail = extractMessage(error.response?.data)
    const fallback = error.response
      ? `请求失败（HTTP ${status ?? '未知'}）`
      : '无法连接后端服务，请确认 http://localhost:8103 已启动'
    return Promise.reject(new ApiError(detail ?? fallback, status))
  },
)

export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return '发生未知错误'
}
