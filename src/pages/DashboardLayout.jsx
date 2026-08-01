import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from '../components/layout/Header'
import KpiBar from '../components/layout/KpiBar'

export default function DashboardLayout() {
  const { hasData, setFilters } = useApp()
  const location = useLocation()

  useEffect(() => {
    if (!location.pathname.includes('/org')) {
      setFilters((f) =>
        f.person && f.person !== 'All' ? { ...f, person: 'All' } : f,
      )
    }
  }, [location.pathname, setFilters])

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
