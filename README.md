# Polaris AI Front

北极星前端骨架，用于验证 [polaris-ai](../polaris-ai) 的 Spring AI 接口链路，并为后续的多轮对话、流式输出提供页面载体。

## 技术栈

| 组件 | 版本 |
|---|---|
| React | 19.3 |
| Markdown | react-markdown + remark-gfm |
| TypeScript | 7.0 |
| Vite | 8.3 |
| Ant Design | 6.7 |
| React Router | 7.18 |
| Axios | 1.21 |
| Zustand | 5.1 |
| Node.js | 22.17（Vite 8 要求 20.19+ / 22.12+） |

## 启动

先启动后端（端口 `8103`，上下文路径 `/api`）：

```bash
cd ../polaris-ai
export JAVA_HOME=/e/Java/jdk-21.0.5
export DEEPSEEK_API_KEY=<your-key>
mvn spring-boot:run
```

再启动前端：

```bash
npm install
npm run dev
```

打开 `http://localhost:5174`。开发服务器把 `/api` 代理到 `http://localhost:8103`，前端代码里只写 `/api/...`，不出现后端地址。

## 脚本

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动开发服务器（5174） |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | Oxlint 检查 |

## 目录

```
polaris-ai-front
├── public/favicon.svg
├── src
│   ├── api
│   │   ├── client.ts          # Axios 实例、统一错误、baseURL=/api
│   │   ├── chat.ts            # /hello、同步 /chat 接口封装
│   │   └── chatStream.ts      # /chat/stream SSE 流式接口
│   ├── components
│   │   ├── AppShell.tsx       # 顶栏、导航、页脚
│   │   └── BackendStatus.tsx  # 后端连通性检测
│   ├── pages
│   │   ├── ChatPage.tsx       # 多轮流式对话页
│   │   └── AboutPage.tsx      # 项目进度与技术栈
│   ├── stores
│   │   └── chatStore.ts       # 会话 ID、消息持久化、流状态与取消
│   ├── styles/global.css      # 全局样式
│   ├── types/api.ts           # 接口类型
│   ├── App.tsx                # 路由表
│   └── main.tsx               # AntD ConfigProvider + Router 入口
├── index.html
├── vite.config.ts             # 5174 端口、/api 代理、@ 别名
└── tsconfig.app.json
```

## 当前接口契约

聊天主链路使用 SSE；普通 JSON 接口没有统一响应包：

```json
GET  /api/hello  -> { "app": "polaris-ai", "message": "Hello, Polaris!" }
POST /api/chat/stream -> SSE: delta { "content": "..." },
                         done { "conversationId": "..." },
                         error { "message": "..." }
POST /api/chat       -> { "content": "..." }     // 同步备用，请求含 message、conversationId
```

前端为每个会话维护稳定的 `conversationId`，并在本地保存已展示消息；刷新后恢复当前会话。发送过程中可停止生成，停止后保留已收到的部分文本。assistant 回复按 Markdown/GFM 渲染；流式主链路使用原生 `fetch` + `ReadableStream`。

如果后端后续引入 `{ code, data, message }` 响应包，只需要改 `src/api/client.ts` 的响应拦截器和两处接口泛型。

## 当前范围

- ✅ 工程骨架：路由、布局、API 层、Zustand 状态、Ant Design 主题
- ✅ 多轮流式对话：`POST /api/chat/stream`，支持停止生成与本地展示记录
- ✅ 后端连通性状态灯：调用 `GET /api/hello`
- ⬜ 结构化输出、工具调用、RAG、MCP 页面（依赖后端 M4–M7）

## M3 流式改造验收

涉及 `src/types/api.ts`、`src/api/chatStream.ts`、`src/stores/chatStore.ts`、`src/pages/ChatPage.tsx`。`npm run lint` 与 `npm run build` 均通过；真实后端流式交互需在后端 8103 启动后按 [M3 验收清单](docs/5-流式对接.md#56-验收清单)执行。

> 与 star-knowledge-assistant 的 Vue 前端不同，本项目按当前选型使用 React + Ant Design，不做代码复用，只在文档层面对照。
