import { useEffect, useRef, useState } from 'react'
import { Alert, Avatar, Button, Input, Space, Typography } from 'antd'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  ClearOutlined,
  RobotOutlined,
  SendOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useChatStore } from '@/stores/chatStore'

const SUGGESTIONS = [
  '用一句话介绍你自己',
  'Spring AI 和 LangChain4j 有什么差异？',
  '给我一个学习 RAG 的路线',
]

export default function ChatPage() {
  const [draft, setDraft] = useState('')
  const { messages, sending, error, send, stop, newConversation, dismissError } = useChatStore()
  const streamRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = streamRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [messages, sending])

  const submit = async (content = draft) => {
    const text = content.trim()
    if (!text || sending) return
    setDraft('')
    await send(text)
  }

  return (
    <section className="chat-page">
      <div className="page-toolbar">
        <div>
          <Typography.Title level={4}>对话</Typography.Title>
          <Typography.Text type="secondary">
            POST /api/chat/stream · SSE 流式 · 多轮记忆
          </Typography.Text>
        </div>
        {messages.length > 0 && (
          <Button icon={<ClearOutlined />} onClick={newConversation}>
            新会话
          </Button>
        )}
      </div>

      <div className="chat-stream" ref={streamRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <RobotOutlined />
            </div>
            <Typography.Title level={3}>你好，我是北极星</Typography.Title>
            <Typography.Paragraph type="secondary">
              前端骨架已就绪，发送一条消息即可验证 Spring AI 对话链路。
            </Typography.Paragraph>
            <Space wrap className="chat-suggestions">
              {SUGGESTIONS.map((item) => (
                <Button key={item} onClick={() => void submit(item)}>
                  {item}
                </Button>
              ))}
            </Space>
          </div>
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className={`chat-message chat-message--${message.role}`}
            >
              <Avatar
                className="chat-avatar"
                icon={message.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
              />
              <div className="chat-bubble">
                {sending && message.role === 'assistant' &&
                message.id === messages.at(-1)?.id &&
                message.content.length === 0 ? (
                  <div className="chat-bubble--loading" aria-label="正在生成">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                ) : message.role === 'assistant' ? (
                  <div className="chat-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <Typography.Text className="chat-content">
                    {message.content}
                  </Typography.Text>
                )}
              </div>
            </article>
          ))
        )}

      </div>

      {error && (
        <Alert
          className="chat-error"
          type="error"
          showIcon
          closable
          message="请求失败"
          description={error}
          onClose={dismissError}
        />
      )}

      <div className="chat-composer">
        <Input.TextArea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="输入消息，Enter 发送，Shift + Enter 换行"
          autoSize={{ minRows: 2, maxRows: 6 }}
          variant="borderless"
          disabled={sending}
          onPressEnter={(event) => {
            if (!event.shiftKey) {
              event.preventDefault()
              void submit()
            }
          }}
        />
        <div className="chat-composer-bar">
          <Typography.Text type="secondary">模型：deepseek-chat</Typography.Text>
          <Button
            type={sending ? 'default' : 'primary'}
            icon={sending ? <StopOutlined /> : <SendOutlined />}
            disabled={!sending && !draft.trim()}
            onClick={() => (sending ? stop() : void submit())}
          >
            {sending ? '停止' : '发送'}
          </Button>
        </div>
      </div>
    </section>
  )
}
