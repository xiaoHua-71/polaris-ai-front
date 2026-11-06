import { Card, Descriptions, Space, Tag, Timeline, Typography } from 'antd'

const FRONTEND_STACK = ['React 19', 'TypeScript 7', 'Vite 8', 'Ant Design 6', 'React Router 7', 'Axios', 'Zustand']
const BACKEND_STACK = ['Spring Boot 4.1.2', 'Spring AI 2.0.2', 'DeepSeek deepseek-chat']

const MILESTONES = [
  { color: 'green', content: 'M0 项目骨架 · 已完成' },
  { color: 'green', content: 'M1 最小对话闭环 · 已完成' },
  { color: 'blue', content: 'M2 多轮对话与记忆 · 下一步' },
  { color: 'gray', content: 'M3 流式输出 · 未开始' },
  { color: 'gray', content: 'M4–M8 结构化输出 / 工具 / RAG / MCP / 工程化 · 未开始' },
]

export default function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-hero">
        <Tag color="blue">Polaris AI</Tag>
        <Typography.Title level={2}>北极星</Typography.Title>
        <Typography.Paragraph type="secondary">
          基于 Spring AI 的个人实验项目，目标走通「对话 → 记忆 → 流式 → 结构化输出 → 工具调用 → RAG → MCP」全链路。
          本前端用于验证后端接口与后续的流式、多轮交互。
        </Typography.Paragraph>
      </div>

      <Space orientation="vertical" size={16} className="about-stack">
        <Card title="当前进度">
          <Timeline items={MILESTONES} />
        </Card>

        <Card title="技术栈">
          <Descriptions
            column={1}
            items={[
              {
                key: 'frontend',
                label: '前端',
                children: (
                  <Space wrap size={[6, 6]}>
                    {FRONTEND_STACK.map((item) => (
                      <Tag key={item}>{item}</Tag>
                    ))}
                  </Space>
                ),
              },
              {
                key: 'backend',
                label: '后端',
                children: (
                  <Space wrap size={[6, 6]}>
                    {BACKEND_STACK.map((item) => (
                      <Tag key={item}>{item}</Tag>
                    ))}
                  </Space>
                ),
              },
              {
                key: 'proxy',
                label: '开发代理',
                children: <Typography.Text code>/api → http://localhost:8103</Typography.Text>,
              },
            ]}
          />
        </Card>

        <Card title="已接入接口">
          <Descriptions
            column={1}
            items={[
              {
                key: 'hello',
                label: 'GET /api/hello',
                children: '连通性检测，页面右上角的状态灯使用该接口。',
              },
              {
                key: 'chat',
                label: 'POST /api/chat',
                children: '同步单轮对话，请求体 { message }，响应体 { content }。',
              },
            ]}
          />
        </Card>

        <Card title="下一步">
          <Typography.Paragraph type="secondary" className="about-last">
            后端完成 M2 / M3 后，在 <Typography.Text code>src/api</Typography.Text> 增加会话与 SSE 客户端，
            在 <Typography.Text code>src/stores</Typography.Text> 扩展多轮状态，并替换当前单轮消息流。
          </Typography.Paragraph>
        </Card>
      </Space>
    </section>
  )
}
