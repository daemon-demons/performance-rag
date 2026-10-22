import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from '../components/layout/Header'

export default function DashboardLayout() {
  const { hasData, setFilters, loadWarnings, dismissLoadWarnings } = useApp()
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
    <div className="min-h-screen bg-page">
      <Header />
      {loadWarnings.length > 0 && (
        <div className="page-shell pt-6" role="status">
          <div className="flex items-start justify-between gap-3 border border-hairline bg-white px-6 py-3">
            <ul>
              {loadWarnings.map((warning, index) => (
                <li key={`${index}-${warning}`} className="type-secondary py-1">
                  {warning}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={dismissLoadWarnings}
              className="hit shrink-0 font-medium text-tessolve-navy"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <main className="pt-6">
        <Outlet />
      </main>
    </div>
  )
}
