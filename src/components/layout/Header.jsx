import { NavLink, useNavigate } from 'react-router-dom'
import {
  LogOut,
  Users,
  Network,
  LayoutDashboard,
  BarChart3,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import FilterBar from '../common/FilterBar'

const TABS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/org', label: 'Org Chart', icon: Network },
  { to: '/roster', label: 'Team Roster', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Header() {
  const { clearData, hasLinkedFile, persistStatus } = useApp()
  const navigate = useNavigate()

  const handleReset = () => {
    clearData()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-tessolve-navy shadow-md shadow-tessolve-navy/20 ring-1 ring-tessolve-blue/40 transition hover:ring-tessolve-orange/50">
            <span className="font-display text-[10px] font-bold tracking-wide text-tessolve-orange">
              RAG
            </span>
          </div>
          <div>
            <p className="font-display text-sm font-bold tracking-tight text-tessolve-navy sm:text-base">
              Tessolve · Performance RAG
            </p>
            <p className="text-xs text-slate-500">
              Welcome Rajmohan
              {hasLinkedFile ? ' · CSV linked' : ''}
              {persistStatus ? ` · ${persistStatus}` : ''}
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-0.5 rounded-xl bg-slate-50 p-1">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-white font-semibold text-tessolve-navy shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'
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
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm transition hover:border-tessolve-navy hover:text-tessolve-navy active:scale-[0.98]"
        >
          <LogOut size={15} />
          New CSV
        </button>
      </div>

      <div className="border-t border-slate-100/80">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <FilterBar />
        </div>
      </div>
    </header>
  )
}
