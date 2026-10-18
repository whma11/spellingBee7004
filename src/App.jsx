import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import PracticePage from './pages/PracticePage'
import { AppStateProvider, useAppState } from './state/AppState'
import { primeVoices } from './lib/speech'
import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    primeVoices()
  }, [])

  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  )
}

function Shell() {
  const { profile } = useAppState()
  if (!profile) return <LoginPage />

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/practice" replace />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
