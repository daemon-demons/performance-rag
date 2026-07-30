import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import WelcomeScreen from './components/welcome/WelcomeScreen'
import DashboardLayout from './pages/DashboardLayout'
import TeamRoster from './components/roster/TeamRoster'
import OrgChart from './components/org/OrgChart'
import DashboardView from './components/dashboard/DashboardView'

const AnalyticsView = lazy(
  () => import('./components/analytics/AnalyticsView'),
)

function WelcomeGate() {
  const { hasData } = useApp()
  if (hasData) return <Navigate to="/dashboard" replace />
  return <WelcomeScreen />
}

function AnalyticsRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-slate-500">
          Loading analytics…
        </div>
      }
    >
      <AnalyticsView />
    </Suspense>
  )
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<WelcomeGate />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/org" element={<OrgChart />} />
            <Route path="/roster" element={<TeamRoster />} />
            <Route path="/analytics" element={<AnalyticsRoute />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}
