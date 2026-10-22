import { useMemo } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import FilterBar from '../common/FilterBar'
import KpiBar from './KpiBar'
import { exportRosterCsv } from '../../utils/csvPersist'
import { buildBillingRunway } from '../../utils/portfolioEngine'

const TABS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/org', label: 'Org' },
  { to: '/roster', label: 'Roster' },
  { to: '/analytics', label: 'Deep dive' },
  { to: '/report', label: 'Report' },
]

const TITLES = Object.fromEntries(TABS.map((tab) => [tab.to, tab.label]))

function decisionSentence(atRisk, lowClients) {
  const parts = []
  if (atRisk === 1) parts.push('1 person is At risk.')
  else if (atRisk > 1) parts.push(`${atRisk} people are At risk.`)
  if (lowClients === 1) parts.push('1 client is under 2 months of billing.')
  else if (lowClients > 1) {
    parts.push(`${lowClients} clients are under 2 months of billing.`)
  }
  return parts.join(' ')
}

export default function Header() {
  const { clearData, hasLinkedFile, persistStatus, rawEmployees, filteredEmployees } =
    useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const onReport = location.pathname.includes('/report')
  const title = TITLES[location.pathname] || 'Dashboard'

  const sentence = useMemo(() => {
    const active = (filteredEmployees || []).filter((e) => !e.isDeparted)
    const atRisk = active.filter((e) => e.ragStatus === 'RED').length
    const lowClients = buildBillingRunway(active).lowAlerts.length
    return decisionSentence(atRisk, lowClients)
  }, [filteredEmployees])

  const handleReset = () => {
    clearData()
    navigate('/')
  }

  const exportCsv = () => {
    if (!rawEmployees?.length) return
    exportRosterCsv(rawEmployees)
  }

  return (
    <header className="command-bar sticky top-0 z-30">
      <div className="page-shell py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-tessolve-navy">
              <span className="font-display text-[11px] font-semibold text-tessolve-orange">
                RAG
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="type-title">{title}</h1>
              {(hasLinkedFile || persistStatus) && (
                <p className="type-secondary">
                  {hasLinkedFile ? 'CSV linked' : ''}
                  {hasLinkedFile && persistStatus ? ' · ' : ''}
                  {persistStatus || ''}
                </p>
              )}
            </div>
          </div>

          <nav className="order-last flex w-full flex-wrap items-center gap-3 md:order-none md:w-auto">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `hit inline-flex items-center ${
                    isActive
                      ? 'font-semibold text-tessolve-navy underline decoration-2 underline-offset-4'
                      : 'type-secondary hover:text-tessolve-navy'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={exportCsv}
              disabled={!rawEmployees?.length}
              className="hit rounded-md border border-hairline bg-white px-3 type-secondary hover:text-tessolve-navy disabled:cursor-not-allowed disabled:opacity-40"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="hit rounded-md border border-hairline bg-white px-3 type-secondary hover:text-tessolve-navy"
            >
              New CSV
            </button>
            {onReport && (
              <button
                type="button"
                onClick={() => window.print()}
                className="hit rounded-md bg-tessolve-orange px-3 font-semibold text-tessolve-navy"
              >
                Print
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="min-w-[16rem] flex-1 basis-full md:basis-auto">
            <KpiBar />
          </div>
          <FilterBar />
          {sentence ? (
            <p className="type-secondary basis-full md:ml-auto md:basis-auto md:text-right">
              {sentence}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  )
}
