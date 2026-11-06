import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import AboutPage from '@/pages/AboutPage'
import ChatPage from '@/pages/ChatPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<ChatPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
