import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { FaxReviewPage } from './pages/FaxReviewPage'
import { InboxPage } from './pages/InboxPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<InboxPage />} />
        <Route path="inbox/:id" element={<FaxReviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
