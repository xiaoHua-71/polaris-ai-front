# Polaris AI Front

北极星前端骨架，用于验证 [polaris-ai](../polaris-ai) 的 Spring AI 接口链路，并为后续的多轮对话、流式输出提供页面载体。

## 技术栈

| 组件 | 版本 |
|---|---|
| React | 19.3 |
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
│   │   └── chat.ts            # /hello、/chat 接口封装
│   ├── components
│   │   ├── AppShell.tsx       # 顶栏、导航、页脚
│   │   └── BackendStatus.tsx  # 后端连通性检测
│   ├── pages
│   │   ├── ChatPage.tsx       # 单轮对话页（当前唯一真实链路）
│   │   └── AboutPage.tsx      # 项目进度与技术栈
│   ├── stores
│   │   └── chatStore.ts       # 消息、发送状态、错误状态
│   ├── styles/global.css      # 全局样式
│   ├── types/api.ts           # 接口类型
│   ├── App.tsx                # 路由表
│   └── main.tsx               # AntD ConfigProvider + Router 入口
├── index.html
├── vite.config.ts             # 5174 端口、/api 代理、@ 别名
└── tsconfig.app.json
```

## 当前接口契约

后端目前返回裸 JSON，没有统一响应包：

```json
GET  /api/hello  -> { "app": "polaris-ai", "message": "Hello, Polaris!" }
POST /api/chat   -> { "content": "..." }        // 请求体 { "message": "..." }
```

如果后端后续引入 `{ code, data, message }` 响应包，只需要改 `src/api/client.ts` 的响应拦截器和两处接口泛型。

## 当前范围

- ✅ 工程骨架：路由、布局、API 层、Zustand 状态、Ant Design 主题
- ✅ 单轮对话：可直接调用现有 `POST /api/chat`
- ✅ 后端连通性状态灯：调用 `GET /api/hello`
- ⬜ 多轮会话（依赖后端 M2）
- ⬜ SSE 流式输出（依赖后端 M3）
- ⬜ 结构化输出、工具调用、RAG、MCP 页面（依赖后端 M4–M7）

> 与 star-knowledge-assistant 的 Vue 前端不同，本项目按当前选型使用 React + Ant Design，不做代码复用，只在文档层面对照。
