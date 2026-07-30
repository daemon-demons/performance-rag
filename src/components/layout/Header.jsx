import { NavLink, useNavigate } from 'react-router-dom'
import { Cpu, LogOut, Users, Network, LayoutDashboard } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import FilterBar from '../common/FilterBar'

const TABS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/org', label: 'Org Chart', icon: Network },
  { to: '/roster', label: 'Team Roster', icon: Users },
]

export default function Header() {
  const { clearData } = useApp()
  const navigate = useNavigate()

  const handleReset = () => {
    clearData()
    navigate('/')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-tessolve-navy">
            <Cpu className="text-tessolve-orange" size={18} />
          </div>
          <div>
            <p className="font-display text-sm font-bold tracking-tight text-tessolve-navy sm:text-base">
              Tessolve · Performance RAG
            </p>
            <p className="text-xs text-slate-500">Welcome Rajmohan</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-1">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition ${
                  isActive
                    ? 'border-tessolve-orange font-semibold text-tessolve-navy'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:border-tessolve-navy hover:text-tessolve-navy"
        >
          <LogOut size={15} />
          New CSV
        </button>
      </div>

      <div className="border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <FilterBar />
        </div>
      </div>
    </header>
  )
}
