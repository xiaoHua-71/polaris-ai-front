import { useEffect, useState } from 'react'
import { Badge, Button, Tooltip } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { fetchHello } from '@/api/chat'
import { toErrorMessage } from '@/api/client'

type Status = 'checking' | 'online' | 'offline'

const STATUS_META: Record<Status, { badge: 'processing' | 'success' | 'error'; label: string }> = {
  checking: { badge: 'processing', label: '检测中' },
  online: { badge: 'success', label: '后端在线' },
  offline: { badge: 'error', label: '后端离线' },
}

interface CheckResult {
  status: Exclude<Status, 'checking'>
  detail: string
}

export default function BackendStatus() {
  const [result, setResult] = useState<CheckResult | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const hello = await fetchHello()
        if (!cancelled) {
          setResult({ status: 'online', detail: `${hello.app} · ${hello.message}` })
        }
      } catch (error) {
        if (!cancelled) {
          setResult({ status: 'offline', detail: toErrorMessage(error) })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const status = result?.status ?? 'checking'
  const detail = result?.detail ?? '正在检测后端连接'
  const meta = STATUS_META[status]

  return (
    <Tooltip title={detail}>
      <span className="backend-status">
        <Badge status={meta.badge} text={meta.label} />
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          aria-label="重新检测后端"
          onClick={() => {
            setResult(null)
            setReloadToken((value) => value + 1)
          }}
        />
      </span>
    </Tooltip>
  )
}
