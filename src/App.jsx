import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import WelcomeScreen from './components/welcome/WelcomeScreen'
import DashboardLayout from './pages/DashboardLayout'
import TeamRoster from './components/roster/TeamRoster'
import OrgChart from './components/org/OrgChart'
import DashboardView from './components/dashboard/DashboardView'

function WelcomeGate() {
  const { hasData } = useApp()
  if (hasData) return <Navigate to="/dashboard" replace />
  return <WelcomeScreen />
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
            <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}
