import { useMemo, useState, lazy, Suspense } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { useApp } from '../../context/AppContext'
import {
  HEATMAP_COLUMNS,
  buildSkillHeatmap,
  buildRoleFunnel,
  buildMentorLoad,
  buildCapabilitySpof,
  buildTeamMeanRadar,
  buildPersonRadar,
  buildLeadershipScores,
  buildAutoInsights,
} from '../../utils/analyticsEngine'
import { RAG_LABELS } from '../../utils/csvSchema'

const WhatIfPanel = lazy(() => import('./WhatIfPanel'))

function heatColor(v) {
  if (v >= 8) return 'bg-emerald-500/90 text-white'
  if (v >= 5) return 'bg-amber-400/80 text-slate-900'
  if (v > 0) return 'bg-orange-200 text-slate-800'
  return 'bg-slate-100 text-slate-400'
}

const VIEWS_KEY = 'performance-rag-saved-views'
const RAG_COLORS = {
  GREEN: '#16A34A',
  AMBER: '#D97706',
  RED: '#DC2626',
}

const FILTER_KEYS = ['client', 'role', 'rag', 'person', 'allocation']

function loadSavedViews() {
  try {
    const parsed = JSON.parse(localStorage.getItem(VIEWS_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((view) => view && typeof view.name === 'string' && view.filters)
      .slice(0, 20)
      .map((view) => ({
        name: view.name.slice(0, 80),
        filters: sanitizeFilters(view.filters),
      }))
  } catch {
    return []
  }
}

function sanitizeFilters(filters) {
  const next = {
    client: 'All',
    role: 'All',
    rag: 'All',
    person: 'All',
    allocation: 'All',
  }
  if (!filters || typeof filters !== 'object') return next
  for (const key of FILTER_KEYS) {
    const value = filters[key]
    if (typeof value === 'string' && value.length > 0 && value.length <= 80) {
      next[key] = value
    }
  }
  return next
}

export default function AnalyticsView() {
  const {
    filteredEmployees,
    employees,
    filters,
    setFilters,
  } = useApp()

  const [compareId, setCompareId] = useState('')
  const [savedViews, setSavedViews] = useState(loadSavedViews)

  const active = useMemo(
    () => filteredEmployees.filter((e) => !e.isDeparted),
    [filteredEmployees],
  )

  const heatmap = useMemo(() => buildSkillHeatmap(active), [active])
  const funnel = useMemo(() => buildRoleFunnel(active), [active])
  const mentors = useMemo(() => buildMentorLoad(filteredEmployees), [filteredEmployees])
  const capability = useMemo(() => buildCapabilitySpof(active), [active])
  const leadership = useMemo(
    () => buildLeadershipScores(filteredEmployees).filter((row) => row.reportCount > 0),
    [filteredEmployees],
  )
  const insights = useMemo(
    () => buildAutoInsights(filteredEmployees, capability),
    [filteredEmployees, capability],
  )
  const teamRadar = useMemo(() => buildTeamMeanRadar(active), [active])

  const compareEmp = useMemo(
    () => employees.find((e) => e.id === compareId) || null,
    [employees, compareId],
  )

  const overlayRadar = useMemo(() => {
    if (!compareEmp) {
      return teamRadar.map((t) => ({ skill: t.skill, team: t.team }))
    }
    const person = buildPersonRadar(compareEmp)
    return teamRadar.map((t, i) => ({
      skill: t.skill,
      team: t.team,
      person: person[i]?.person ?? 0,
    }))
  }, [teamRadar, compareEmp])

  const saveCurrentView = () => {
    const name = window.prompt('Name this view', filters.client || 'My view')
    if (!name) return
    const next = [
      ...savedViews.filter((v) => v.name !== name.slice(0, 80)),
      { name: name.slice(0, 80), filters: sanitizeFilters(filters) },
    ].slice(0, 20)
    setSavedViews(next)
    localStorage.setItem(VIEWS_KEY, JSON.stringify(next))
  }

  const applyView = (view) => {
    setFilters({ ...view.filters })
  }

  return (
    <div className="page-shell pb-6">
      <section className="panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="type-title">
          Active headcount · {active.length}
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={saveCurrentView}
            className="hit rounded-md border border-hairline bg-white px-3 font-medium text-ink"
          >
            Save view
          </button>
          {savedViews.length > 0 && (
            <select
              aria-label="Apply saved analytics view"
              className="hit rounded-md border border-hairline bg-white px-3"
              defaultValue=""
              onChange={(e) => {
                const v = savedViews.find((x) => x.name === e.target.value)
                if (v) applyView(v)
                e.target.value = ''
              }}
            >
              <option value="">Saved views…</option>
              {savedViews.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="mt-6 divide-y divide-hairline border-t border-hairline">
      <div className="grid lg:grid-cols-3 lg:divide-x lg:divide-slate-300">
        <section className="py-6 lg:col-span-2 lg:pr-6">
          <h3 className="type-title mb-3">
            Skill coverage
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="px-2 py-2 font-medium">Name</th>
                  {HEATMAP_COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      className="px-1 py-2 text-center font-medium"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmap.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-50 transition hover:bg-slate-50/80"
                  >
                    <td className="px-2 py-1.5 font-medium text-slate-800">
                      {row.name}
                      <span className="ml-1 text-[10px] text-slate-400">
                        {row.client}
                      </span>
                    </td>
                    {HEATMAP_COLUMNS.map((c) => (
                      <td key={c.key} className="px-1 py-1.5 text-center">
                        <span
                          className={`inline-block min-w-[1.75rem] rounded-md px-1.5 py-0.5 font-mono text-[10px] ${heatColor(row.cells[c.key])}`}
                        >
                          {row.cells[c.key]}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-t border-slate-300 py-6 lg:border-t-0 lg:pl-6">
          <h3 className="type-title mb-3">Findings</h3>
          <ul className="space-y-3">
            {insights.length === 0 && (
              <li className="text-sm text-slate-500">No critical insights.</li>
            )}
            {insights.map((t) => (
              <li key={t} className="text-xs leading-relaxed text-slate-700">
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-slate-300">
        <section className="py-6 lg:pr-6">
          <h3 className="type-title mb-3">
            Readiness by role
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="role" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'avgGap') return [value, 'Avg gap']
                    return [value, name]
                  }}
                  labelFormatter={(label, payload) => {
                    const gap = payload?.[0]?.payload?.avgGap
                    return gap != null ? `${label} (gap ${gap})` : label
                  }}
                />
                <Legend
                  itemSorter={(item) => {
                    const order = { Ready: 0, Watch: 1, 'At risk': 2 }
                    return order[item.value] ?? 99
                  }}
                />
                <Bar
                  dataKey="green"
                  stackId="a"
                  fill={RAG_COLORS.GREEN}
                  name={RAG_LABELS.GREEN}
                />
                <Bar
                  dataKey="amber"
                  stackId="a"
                  fill={RAG_COLORS.AMBER}
                  name={RAG_LABELS.AMBER}
                />
                <Bar
                  dataKey="red"
                  stackId="a"
                  fill={RAG_COLORS.RED}
                  name={RAG_LABELS.RED}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="border-t border-slate-300 py-6 lg:border-t-0 lg:pl-6">
          <h3 className="type-title mb-3">Mentor span</h3>
          <div className="max-h-64 overflow-y-auto">
            {mentors.map((m) => (
              <div
                key={m.mentor}
                className="flex min-w-0 items-baseline justify-between gap-3 border-b border-slate-300 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">{m.mentor}</p>
                  <p className="text-[11px] text-slate-500">
                    {m.menteeCount} mentees · {RAG_LABELS.GREEN} {m.green} · {RAG_LABELS.AMBER} {m.amber} · {RAG_LABELS.RED} {m.red}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-slate-500">
                  risk {m.riskScore}
                </span>
              </div>
            ))}
            {!mentors.length && (
              <p className="text-sm text-slate-500">
                No mentor links in roster.
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-slate-300">
        <section className="py-6 lg:pr-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="type-title">
              Skill vs team mean
            </h3>
            <select
              aria-label="Compare person against team mean"
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs shadow-sm"
              value={compareId}
              onChange={(e) => setCompareId(e.target.value)}
            >
              <option value="">Team mean only</option>
              {active.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.Employee_Name}
                </option>
              ))}
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={overlayRadar}
                cx="50%"
                cy="50%"
                outerRadius="70%"
              >
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} />
                <Radar
                  name="Team"
                  dataKey="team"
                  stroke="#23A6E3"
                  fill="#23A6E3"
                  fillOpacity={0.2}
                />
                {compareEmp && (
                  <Radar
                    name={compareEmp.Employee_Name}
                    dataKey="person"
                    stroke="#F2802B"
                    fill="#F2802B"
                    fillOpacity={0.25}
                  />
                )}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="border-t border-slate-300 py-6 lg:border-t-0 lg:pl-6">
          <h3 className="type-title mb-3">
            Single-point skills
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="py-2 pr-2">Client</th>
                  <th className="px-1 py-2">SMT8</th>
                  <th className="px-1 py-2">CONT</th>
                  <th className="px-1 py-2">IP Adv</th>
                  <th className="px-1 py-2">SC</th>
                  <th className="px-1 py-2">SOD</th>
                  <th className="py-2 pl-2">Flags</th>
                </tr>
              </thead>
              <tbody>
                {capability.map((c) => (
                  <tr key={c.client} className="border-b border-slate-50">
                    <td className="py-2 pr-2 font-medium text-slate-800">
                      {c.client}
                    </td>
                    <td className="px-1 py-2 font-mono">{c.smt8}</td>
                    <td className="px-1 py-2 font-mono">{c.contBringup}</td>
                    <td className="px-1 py-2 font-mono">{c.ipAdvanced}</td>
                    <td className="px-1 py-2 font-mono">{c.sc}</td>
                    <td className="px-1 py-2 font-mono">{c.sod}</td>
                    <td className="py-2 pl-2 text-rag-amber">
                      {c.flags.join('; ') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="py-6">
        <h3 className="type-title mb-3">
          Span of control
        </h3>
        <div>
          {leadership.map((l) => (
            <div
              key={l.id}
              className="flex min-w-0 flex-wrap items-baseline justify-between gap-3 border-b border-hairline py-3"
            >
              <p className="font-semibold text-tessolve-navy">
                {l.name}
                <span className="ml-3 font-normal type-secondary">
                  {l.role} · {l.reportCount} reports
                </span>
              </p>
              <p className="type-secondary">
                <span className="font-semibold text-ink">{l.score}</span>
                {' · '}
                {l.greenShare}% {RAG_LABELS.GREEN} · {l.failedRate}% failed · avg{' '}
                {l.avgOverall}
              </p>
            </div>
          ))}
          {!leadership.length && (
            <p className="text-sm text-slate-500">No leader roles in view.</p>
          )}
        </div>
      </section>

      <Suspense
        fallback={<p className="py-6 text-sm text-slate-500">Loading what-if…</p>}
      >
        <WhatIfPanel />
      </Suspense>
      </div>
      </section>
    </div>
  )
}
