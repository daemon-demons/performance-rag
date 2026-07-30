import { Navigate, Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from '../components/layout/Header'
import KpiBar from '../components/layout/KpiBar'

export default function DashboardLayout() {
  const { hasData } = useApp()

  if (!hasData) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <KpiBar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
