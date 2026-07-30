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
import { Download, Lightbulb, Users } from 'lucide-react'
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
import { employeesToCsv, downloadCsvText } from '../../utils/csvPersist'

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

function loadSavedViews() {
  try {
    return JSON.parse(localStorage.getItem(VIEWS_KEY) || '[]')
  } catch {
    return []
  }
}

export default function AnalyticsView() {
  const {
    filteredEmployees,
    employees,
    rawEmployees,
    filters,
    setFilters,
    persistRoster,
  } = useApp()

  const [compareId, setCompareId] = useState('')
  const [savedViews, setSavedViews] = useState(loadSavedViews)

  const active = useMemo(
    () => filteredEmployees.filter((e) => !e.isDeparted),
    [filteredEmployees],
  )

  const heatmap = useMemo(() => buildSkillHeatmap(active), [active])
  const funnel = useMemo(() => buildRoleFunnel(active), [active])
  const mentors = useMemo(() => buildMentorLoad(employees), [employees])
  const capability = useMemo(() => buildCapabilitySpof(active), [active])
  const leadership = useMemo(
    () => buildLeadershipScores(employees),
    [employees],
  )
  const insights = useMemo(
    () => buildAutoInsights(employees, capability),
    [employees, capability],
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
      ...savedViews.filter((v) => v.name !== name),
      { name, filters: { ...filters } },
    ]
    setSavedViews(next)
    localStorage.setItem(VIEWS_KEY, JSON.stringify(next))
  }

  const applyView = (view) => {
    setFilters({ ...view.filters })
  }

  const exportCsv = async () => {
    if (rawEmployees?.length) {
      const result = await persistRoster()
      if (result?.method === 'file') return
    }
    downloadCsvText(
      employeesToCsv(rawEmployees || []),
      'team_roster_export.csv',
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-tessolve-navy">
            Analytics
          </h2>
          <p className="text-sm text-slate-500">
            Coverage, readiness, and risk deep-dive · {active.length} active
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-tessolve-blue hover:text-tessolve-navy"
          >
            <Download size={14} />
            Export CSV
          </button>
          <button
            type="button"
            onClick={saveCurrentView}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-tessolve-orange"
          >
            Save view
          </button>
          {savedViews.length > 0 && (
            <select
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm shadow-sm"
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-plush lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            Skill coverage heatmap
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
        </div>

        <div className="card-plush">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <Lightbulb size={15} className="text-tessolve-orange" />
            Insights
          </h3>
          <ul className="space-y-2">
            {insights.length === 0 && (
              <li className="text-sm text-slate-500">No critical insights.</li>
            )}
            {insights.map((t) => (
              <li
                key={t}
                className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs leading-relaxed text-slate-700"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-plush">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            Role readiness funnel
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="role" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name, props) => {
                    if (name === 'avgGap') return [value, 'Avg gap']
                    return [value, name]
                  }}
                  labelFormatter={(label, payload) => {
                    const gap = payload?.[0]?.payload?.avgGap
                    return gap != null ? `${label} (gap ${gap})` : label
                  }}
                />
                <Legend />
                <Bar
                  dataKey="green"
                  stackId="a"
                  fill={RAG_COLORS.GREEN}
                  name="Green"
                />
                <Bar
                  dataKey="amber"
                  stackId="a"
                  fill={RAG_COLORS.AMBER}
                  name="Amber"
                />
                <Bar
                  dataKey="red"
                  stackId="a"
                  fill={RAG_COLORS.RED}
                  name="Red"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-plush">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <Users size={15} className="text-tessolve-blue" />
            Mentor load
          </h3>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {mentors.map((m) => (
              <div
                key={m.mentor}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm transition hover:border-tessolve-blue/40"
              >
                <div>
                  <p className="font-medium text-slate-800">{m.mentor}</p>
                  <p className="text-[11px] text-slate-500">
                    {m.menteeCount} mentees · G{m.green}/A{m.amber}/R{m.red}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
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
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-plush">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-800">
              Peer vs team radar
            </h3>
            <select
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
        </div>

        <div className="card-plush">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">
            Capability SPOF by client
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
        </div>
      </div>

      <div className="card-plush">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Leadership effectiveness
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {leadership.map((l) => (
            <div
              key={l.id}
              className="rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 px-3 py-3 transition hover:shadow-md"
            >
              <p className="font-display text-sm font-semibold text-tessolve-navy">
                {l.name}
              </p>
              <p className="text-[11px] text-slate-500">
                {l.role} · {l.reportCount} reports
              </p>
              <p className="mt-2 font-mono text-lg text-tessolve-orange">
                {l.score}
              </p>
              <p className="text-[11px] text-slate-500">
                {l.greenShare}% green · {l.failedRate}% failed resp · avg{' '}
                {l.avgOverall}
              </p>
            </div>
          ))}
          {!leadership.length && (
            <p className="text-sm text-slate-500">No leader roles in view.</p>
          )}
        </div>
      </div>

      <Suspense
        fallback={
          <div className="card-plush text-sm text-slate-500">
            Loading what-if…
          </div>
        }
      >
        <WhatIfPanel />
      </Suspense>
    </div>
  )
}
