import { CompassOutlined, CommentOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Layout, Menu, Typography } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import BackendStatus from '@/components/BackendStatus'

const { Header, Content, Footer } = Layout
const CURRENT_YEAR = new Date().getFullYear()

const NAV_ITEMS = [
  { key: '/', icon: <CommentOutlined />, label: '对话' },
  { key: '/about', icon: <InfoCircleOutlined />, label: '关于' },
]

export default function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedKey = NAV_ITEMS.some((item) => item.key === location.pathname)
    ? location.pathname
    : '/'

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <button type="button" className="app-brand" onClick={() => navigate('/')}>
          <span className="app-logo" aria-hidden="true">
            <CompassOutlined />
          </span>
          <span className="app-brand-copy">
            <strong>北极星</strong>
            <small>Polaris AI</small>
          </span>
        </button>

        <Menu
          className="app-nav"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={NAV_ITEMS}
          onClick={({ key }) => navigate(key)}
        />

        <BackendStatus />
      </Header>

      <Content className="app-main">
        <Outlet />
      </Content>

      <Footer className="app-footer">
        <Typography.Text type="secondary">
          Polaris AI · Spring AI 实验项目 · {CURRENT_YEAR}
        </Typography.Text>
      </Footer>
    </Layout>
  )
}
