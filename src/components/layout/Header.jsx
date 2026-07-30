import { NavLink, useNavigate } from 'react-router-dom'
import { Cpu, LogOut, Users, Network, BarChart3 } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import FilterBar from '../common/FilterBar'

const TABS = [
  { to: '/roster', label: 'Team Roster', icon: Users },
  { to: '/org', label: 'Org Chart', icon: Network },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Header() {
  const { clearData } = useApp()
  const navigate = useNavigate()

  const handleReset = () => {
    clearData()
    navigate('/')
  }

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="border-b-4 border-transparent bg-gradient-to-r from-tessolve-orange via-orange-400 to-tessolve-blue pb-0">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
              <Cpu className="text-white" size={22} />
            </div>
            <div>
              <p className="font-display text-lg font-bold tracking-tight text-white">
                Tessolve · Performance RAG
              </p>
              <p className="text-xs text-white/80">Welcome Rajmohan</p>
            </div>
          </div>

          <nav className="flex flex-wrap gap-1">
            {TABS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white text-slate-900 shadow'
                      : 'text-white/90 hover:bg-white/15'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white hover:bg-white/25"
          >
            <LogOut size={16} />
            New CSV
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <FilterBar />
      </div>
    </header>
  )
}
