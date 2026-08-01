import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useApp } from '../../context/AppContext'
import ClientRiskPanel from '../risk/ClientRiskPanel'
import {
  buildAllocationMix,
  buildFocusMix,
  buildTypeMix,
  buildBillingRunway,
  buildCommitmentSwot,
  listCommitments,
  buildReadinessSummary,
} from '../../utils/portfolioEngine'

const PIE_COLORS = ['#23A6E3', '#F2802B', '#64748b', '#16A34A']

function Card({ title, caption, children, className = '' }) {
  return (
    <div className={`card-plush ${className}`}>
      <h3 className="text-sm font-semibold text-tessolve-navy">{title}</h3>
      {caption && (
        <p className="mt-0.5 text-xs leading-snug text-slate-500">{caption}</p>
      )}
      <div className="mt-3">{children}</div>
    </div>
  )
}

function SwotColumn({ title, tone, items, onPerson }) {
  const tones = {
    strength: 'border-emerald-200 bg-emerald-50/80',
    gap: 'border-amber-200 bg-amber-50/80',
    opportunity: 'border-sky-200 bg-sky-50/80',
    risk: 'border-red-200 bg-red-50/80',
  }
  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      <p className="text-xs font-semibold tracking-wide text-slate-700 uppercase">
        {title}
      </p>
      {!items.length ? (
        <p className="mt-2 text-xs text-slate-500">None flagged.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li key={item.id + item.text}>
              <button
                type="button"
                onClick={() => item.id && !String(item.id).startsWith('spof') && onPerson?.(item.id)}
                className="text-left text-xs leading-snug text-slate-700 transition hover:text-tessolve-navy hover:underline"
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function DashboardView() {
  const {
    filteredEmployees,
    clientRisk,
    filters,
    setFilters,
    kpis,
    setSelectedEmployeeId,
  } = useApp()

  const active = useMemo(
    () => filteredEmployees.filter((e) => !e.isDeparted),
    [filteredEmployees],
  )

  const readiness = useMemo(() => buildReadinessSummary(active), [active])
  const allocation = useMemo(() => buildAllocationMix(active), [active])
  const focusMix = useMemo(() => buildFocusMix(active), [active])
  const typeMix = useMemo(() => buildTypeMix(active), [active])
  const billing = useMemo(() => buildBillingRunway(active), [active])
  const commitments = useMemo(() => listCommitments(active), [active])

  const [commitment, setCommitment] = useState('')
  const selectedCommitment = commitment || commitments[0] || ''
  const swot = useMemo(
    () => buildCommitmentSwot(active, selectedCommitment),
    [active, selectedCommitment],
  )

  const filterNote =
    filters.client !== 'All' ? ` · filtered to ${filters.client}` : ''

  return (
    <div className="page-shell space-y-4 pb-10">
      <section className="animate-fade-up rounded-2xl border border-tessolve-blue/20 bg-gradient-to-r from-tessolve-navy to-tessolve-navy-mid px-4 py-4 text-white shadow-md sm:px-5">
        <p className="font-display text-xs font-semibold tracking-wide text-tessolve-orange uppercase">
          Team readiness for delivery
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold sm:text-2xl">
          See who is ready, who is billed, and where the next commitment is at
          risk
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Ready / Watch / At risk is based on skills and role expectations.
          Click tiles or the allocation chart to filter; click a name to open
          their profile.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white/10 px-2.5 py-1">
            {readiness.ready} Ready
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-1">
            {readiness.watch} Watch
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-1">
            {readiness.atRisk} At risk
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-1">
            {allocation.project} on project · {allocation.bench} on bench
          </span>
          {billing.lowAlerts.length > 0 && (
            <span className="rounded-full bg-rag-red/90 px-2.5 py-1 font-medium">
              {billing.lowAlerts.length} client(s) with &lt;2 months billing
            </span>
          )}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() =>
            setFilters((f) => ({
              ...f,
              rag: f.rag === 'GREEN' ? 'All' : 'GREEN',
            }))
          }
          className="card-plush-interactive text-left"
        >
          <p className="text-[11px] text-slate-500 uppercase">Ready</p>
          <p className="font-display text-2xl font-semibold text-rag-green">
            {kpis.green}
          </p>
          <p className="text-xs text-slate-500">Click to filter Green</p>
        </button>
        <button
          type="button"
          onClick={() =>
            setFilters((f) => ({
              ...f,
              rag: f.rag === 'AMBER' ? 'All' : 'AMBER',
            }))
          }
          className="card-plush-interactive text-left"
        >
          <p className="text-[11px] text-slate-500 uppercase">Watch</p>
          <p className="font-display text-2xl font-semibold text-rag-amber">
            {kpis.amber}
          </p>
          <p className="text-xs text-slate-500">Click to filter Amber</p>
        </button>
        <button
          type="button"
          onClick={() =>
            setFilters((f) => ({
              ...f,
              allocation: f.allocation === 'Project' ? 'All' : 'Project',
            }))
          }
          className="card-plush-interactive text-left"
        >
          <p className="text-[11px] text-slate-500 uppercase">On project</p>
          <p className="font-display text-2xl font-semibold text-tessolve-blue">
            {kpis.project}
          </p>
          <p className="text-xs text-slate-500">
            of {active.length} active{filterNote}
          </p>
        </button>
        <button
          type="button"
          onClick={() =>
            setFilters((f) => ({
              ...f,
              allocation: f.allocation === 'Bench' ? 'All' : 'Bench',
            }))
          }
          className="card-plush-interactive text-left"
        >
          <p className="text-[11px] text-slate-500 uppercase">On bench</p>
          <p className="font-display text-2xl font-semibold text-tessolve-orange">
            {kpis.bench}
          </p>
          <p className="text-xs text-slate-500">Available for next work</p>
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title="Project vs bench"
          caption={`${allocation.project} of ${allocation.total} people are on project work.`}
        >
          {allocation.total === 0 ? (
            <p className="text-sm text-slate-500">No people — clear filters.</p>
          ) : (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation.chart}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={2}
                    onClick={(d) => {
                      if (d?.key) {
                        setFilters((f) => ({
                          ...f,
                          allocation:
                            f.allocation === d.key ? 'All' : d.key,
                        }))
                      }
                    }}
                  >
                    {allocation.chart.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                        className="cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card
          title="NPI vs Sustaining"
          caption={`Among people on project: how many focus on NPI or Sustaining.`}
        >
          {focusMix.total === 0 ? (
            <p className="text-sm text-slate-500">
              No project people in view — clear filters.
            </p>
          ) : (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={focusMix.chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#23A6E3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card
          title="FT vs WS work"
          caption="FT and WS are different project types among people on project."
        >
          {typeMix.total === 0 ? (
            <p className="text-sm text-slate-500">
              No project people in view — clear filters.
            </p>
          ) : (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeMix.chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F2802B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card
          title="Months of billing left"
          caption="Average billing runway by client for people on project. Red = someone under 2 months."
        >
          {billing.chart.length === 0 ? (
            <p className="text-sm text-slate-500">
              No project billing data in view.
            </p>
          ) : (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={billing.chart} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={72}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="months" radius={[0, 4, 4, 0]}>
                    {billing.chart.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card
          title="Commitment SWOT"
          caption="Strengths, gaps, available bench, and risks for an upcoming commitment."
        >
          <label className="mb-3 block text-xs text-slate-500">
            Upcoming commitment
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm shadow-sm"
              value={selectedCommitment}
              onChange={(e) => setCommitment(e.target.value)}
            >
              {!commitments.length && (
                <option value="">No commitments in CSV</option>
              )}
              {commitments.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          {selectedCommitment ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <SwotColumn
                title="Strengths"
                tone="strength"
                items={swot.strengths}
                onPerson={setSelectedEmployeeId}
              />
              <SwotColumn
                title="Gaps"
                tone="gap"
                items={swot.gaps}
                onPerson={setSelectedEmployeeId}
              />
              <SwotColumn
                title="Available bench"
                tone="opportunity"
                items={swot.opportunities}
                onPerson={setSelectedEmployeeId}
              />
              <SwotColumn
                title="Risks"
                tone="risk"
                items={swot.risks}
                onPerson={setSelectedEmployeeId}
              />
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Add Upcoming_Commitment in the CSV to evaluate commitments.
            </p>
          )}
        </Card>
      </div>

      <div>
        <h3 className="mb-1 text-sm font-semibold text-tessolve-navy">
          Client health
        </h3>
        <p className="mb-3 text-xs text-slate-500">
          Single point of failure = fewer than 2 strong people on that client
          (SMT 8/Both or Platform ≥ 8).
        </p>
        <ClientRiskPanel
          clients={clientRisk.clients}
          spofAlerts={clientRisk.spofAlerts}
        />
      </div>
    </div>
  )
}
