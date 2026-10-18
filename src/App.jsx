import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import PracticePage from './pages/PracticePage'
import { AppStateProvider } from './state/AppState'
import { primeVoices } from './lib/speech'
import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    primeVoices()
  }, [])

  return (
    <AppStateProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/practice" replace />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppStateProvider>
  )
}
