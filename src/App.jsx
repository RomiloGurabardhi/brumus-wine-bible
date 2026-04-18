import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import PublicApp from './pages/PublicApp'

const AdminApp = lazy(() => import('./pages/AdminApp'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<PublicApp />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="loading-wrap"><div className="spinner" /></div>}>
              <AdminApp />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
