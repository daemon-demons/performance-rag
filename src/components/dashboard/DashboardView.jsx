import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { useApp } from '../../context/AppContext'
import {
  buildBookedByClient,
  buildBillingRunway,
  buildAttentionList,
} from '../../utils/portfolioEngine'
import {
  buildLeadershipScores,
  buildMentorLoad,
  buildRoleFunnel,
} from '../../utils/analyticsEngine'
import { buildHierarchyIssues, buildTeamBalance } from '../../utils/teamShape'
import { exceptionAction } from '../../utils/reportBrief'

const READY = '#16A34A'
const WATCH = '#D97706'
const AT_RISK = '#DC2626'
const CHART_MARGIN = { top: 12, right: 12, bottom: 0, left: 0 }

function LegendDot({ color, label, dashed = false }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`h-2 w-3 shrink-0 rounded-[2px] ${dashed ? 'border border-dashed' : ''}`}
        style={dashed ? { borderColor: color } : { backgroundColor: color }}
      />
      {label}
    </span>
  )
}

function Plot({ children, legend }) {
  return (
    <div>
      <div className="h-56">{children}</div>
      <div className="mt-3 flex h-4 items-center justify-center gap-x-3 type-secondary">
        {legend}
      </div>
    </div>
  )
}

function StackedBars({ data, bars, empty }) {
  return (
    <Plot
      legend={bars.map((bar) => (
        <LegendDot key={bar.key} color={bar.fill} label={bar.label || bar.key} />
      ))}
    >
      {data.length === 0 ? (
        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
          {empty}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
            <Tooltip />
            {bars.map((bar) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                name={bar.label || bar.key}
                stackId="mix"
                fill={bar.fill}
                className={bar.onClick ? 'cursor-pointer' : undefined}
                onClick={
                  bar.onClick
                    ? (row) => bar.onClick(row?.name || row?.payload?.name)
                    : undefined
                }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </Plot>
  )
}

function ChartBlock({ title, label, children }) {
  return (
    <div role="group" aria-label={label}>
      <h3 className="type-title">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  )
}

const REASON_TEXT = {
  'at-risk': { label: 'At risk', className: 'text-status-risk' },
  projections: { label: 'Projections not current', className: 'text-status-watch' },
  spof: { label: 'Single point of failure', className: 'text-ink' },
  failed: { label: 'Failed', className: 'text-status-risk' },
}

function scoreFill(score) {
  if (score >= 70) return READY
  if (score >= 40) return WATCH
  return AT_RISK
}

function MixBars({ data, empty, label, onName, plotClass = '' }) {
  const style = plotClass ? undefined : { height: Math.max(160, data.length * 32 + 24) }
  return (
    <div role="group" aria-label={label} className={plotClass} style={style}>
      {data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-center type-secondary">
          {empty}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" width={108} tick={{ fontSize: 11 }} />
            <Tooltip />
            {['Ready', 'Watch', 'At risk'].map((key) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="mix"
                fill={key === 'Ready' ? READY : key === 'Watch' ? WATCH : AT_RISK}
                className={onName ? 'cursor-pointer' : undefined}
                onClick={
                  onName
                    ? (row) => onName(row?.name || row?.payload?.name)
                    : undefined
                }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function AttentionPanel({ groups, onClient, onAtRisk, onPerson }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <h2 className="type-title">Exceptions</h2>
      {!groups.length ? (
        <p className="type-secondary mt-6">No one needs monitoring in this view.</p>
      ) : (
        <div className="mt-6 min-h-0 flex-1 space-y-6 overflow-y-auto">
          {groups.map((group) => (
            <section key={group.client}>
              <button
                type="button"
                onClick={() => onClient(group.client)}
                className="hit text-left font-semibold text-tessolve-navy"
              >
                {group.client}
                <span className="ml-3 font-normal type-secondary">
                  {group.people.length}
                </span>
              </button>
              <ul className="mt-3">
                {group.people.map((person) => (
                  <li
                    key={person.id}
                    className="flex flex-wrap items-baseline gap-3 border-b border-hairline py-3"
                  >
                    <button
                      type="button"
                      onClick={() => onPerson(person.id)}
                      className="hit text-left font-medium text-tessolve-navy"
                    >
                      {person.name}
                    </button>
                    <p className="type-secondary">{person.billingMonths} mo</p>
                    <div className="flex flex-wrap gap-3">
                      {person.reasons.map((reason) => {
                        const meta = REASON_TEXT[reason.id]
                        const label =
                          reason.id === 'failed'
                            ? `Failed ${reason.count}`
                            : meta.label
                        return (
                          <button
                            key={reason.id}
                            type="button"
                            onClick={() =>
                              reason.id === 'at-risk'
                                ? onAtRisk(person.client)
                                : onClient(person.client)
                            }
                            className={`hit font-medium ${meta.className}`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                    {person.action ? (
                      <p className="type-secondary basis-full">{person.action}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardView() {
  const {
    filteredEmployees,
    employees,
    clientRisk,
    setFilters,
  } = useApp()
  const navigate = useNavigate()

  const active = useMemo(
    () => filteredEmployees.filter((e) => !e.isDeparted),
    [filteredEmployees],
  )

  const booked = useMemo(() => buildBookedByClient(active), [active])
  const billing = useMemo(() => buildBillingRunway(active), [active])
  const readinessByClient = useMemo(
    () =>
      (clientRisk.clients || [])
        .filter((c) => c.green + c.amber + c.red > 0)
        .map((c) => ({
          name: c.client,
          Ready: c.green,
          Watch: c.amber,
          'At risk': c.red,
        })),
    [clientRisk.clients],
  )
  const attention = useMemo(() => {
    const built = buildAttentionList(active, clientRisk.spofAlerts)
    const byId = new Map(filteredEmployees.map((person) => [person.id, person]))
    return {
      ...built,
      groups: built.groups.map((group) => ({
        ...group,
        people: group.people.map((person) => ({
          ...person,
          action: exceptionAction(byId.get(person.id), filteredEmployees, employees),
        })),
      })),
    }
  }, [active, clientRisk.spofAlerts, filteredEmployees, employees])
  const balance = useMemo(() => buildTeamBalance(active), [active])
  const issues = useMemo(
    () => buildHierarchyIssues(filteredEmployees),
    [filteredEmployees],
  )
  const funnel = useMemo(
    () =>
      buildRoleFunnel(active).map((row) => ({
        name: row.role,
        Ready: row.green,
        Watch: row.amber,
        'At risk': row.red,
      })),
    [active],
  )
  const mentors = useMemo(
    () =>
      buildMentorLoad(filteredEmployees).map((row) => ({
        name: row.mentor,
        Ready: row.green,
        Watch: row.amber,
        'At risk': row.red,
      })),
    [filteredEmployees],
  )
  const leaders = useMemo(
    () =>
      buildLeadershipScores(filteredEmployees)
        .filter((row) => row.reportCount > 0)
        .map((row) => ({
          id: row.id,
          name: `${row.name} · ${row.reportCount}`,
          score: row.score,
        })),
    [filteredEmployees],
  )

  const toggleClientStatus = (client, rag) => {
    if (!client) return
    setFilters((f) => {
      const same = f.client === client && f.rag === rag
      return {
        ...f,
        client: same ? 'All' : client,
        rag: same ? 'All' : rag,
      }
    })
  }

  const toggleClient = (client) => {
    if (!client) return
    setFilters((f) => ({
      ...f,
      client: f.client === client ? 'All' : client,
    }))
  }

  const toggleRole = (role) => {
    if (!role) return
    setFilters((f) => ({
      ...f,
      role: f.role === role ? 'All' : role,
    }))
  }

  const seniorGrow = balance.senior || (balance.junior ? 0 : 1)
  const juniorGrow = balance.junior || (balance.senior ? 0 : 1)

  return (
    <div className="page-shell flex flex-col gap-6 pb-6">
    <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="panel flex h-full flex-col p-6" aria-label="Client position">
        <h2 className="type-title">Client position</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartBlock
          title="Readiness by client"
          label="Readiness by client. Ready, Watch, and At risk on each client."
        >
          <StackedBars
            data={readinessByClient}
            empty="No people in view — clear filters."
            bars={[
              {
                key: 'Ready',
                fill: READY,
                onClick: (client) => toggleClientStatus(client, 'GREEN'),
              },
              {
                key: 'Watch',
                fill: WATCH,
                onClick: (client) => toggleClientStatus(client, 'AMBER'),
              },
              {
                key: 'At risk',
                fill: AT_RISK,
                onClick: (client) => toggleClientStatus(client, 'RED'),
              },
            ]}
          />
        </ChartBlock>

        <ChartBlock
          title="Shortest billing left"
          label="Shortest billing left. Fewest months left on each client. A red bar is under 2 months."
        >
          <Plot
            legend={
              <LegendDot color={AT_RISK} label="2 months" dashed />
            }
          >
            {billing.chart.length === 0 ? (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
                No project billing data in view.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={billing.chart}
                  layout="vertical"
                  margin={CHART_MARGIN}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={72}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <ReferenceLine x={2} stroke={AT_RISK} strokeDasharray="4 4" />
                  <Bar
                    dataKey="shortest"
                    name="Shortest months"
                    radius={[0, 4, 4, 0]}
                    className="cursor-pointer"
                    onClick={(row) =>
                      toggleClient(row?.name || row?.payload?.name)
                    }
                  >
                    {billing.chart.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Plot>
        </ChartBlock>
        <ChartBlock
          title="NPI vs Sustaining"
          label="NPI versus Sustaining. People on project, by client."
        >
          <StackedBars
            data={booked.chart}
            empty="No project people in view — clear filters."
            bars={[
              { key: 'NPI', fill: '#23A6E3', onClick: toggleClient },
              { key: 'Sustaining', fill: '#1E3A5F', onClick: toggleClient },
            ]}
          />
        </ChartBlock>

        <ChartBlock
          title="FT, WS, and Both"
          label="FT, WS, and Both. Tester type among people on project, by client."
        >
          <StackedBars
            data={booked.chart}
            empty="No project people in view — clear filters."
            bars={[
              { key: 'FT', fill: '#F2802B', onClick: toggleClient },
              { key: 'WS', fill: '#23A6E3', onClick: toggleClient },
              { key: 'Both', fill: '#64748B', onClick: toggleClient },
            ]}
          />
        </ChartBlock>
        </div>
        <p className="type-secondary mt-6">Click a color or a bar to filter.</p>
      </section>
      <section
        className="panel flex h-full min-h-0 flex-col overflow-hidden border-l-[3px] border-l-tessolve-navy p-6"
        aria-label="Exceptions"
      >
        <AttentionPanel
          groups={attention.groups}
          onClient={toggleClient}
          onAtRisk={(client) => toggleClientStatus(client, 'RED')}
          onPerson={(id) =>
            navigate('/report', { state: { level: 'person', personId: id } })
          }
        />
      </section>
    </div>

    <section className="panel p-6" aria-label="Grade mix">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="type-title">Grade mix</h2>
        <div className="flex hit min-w-[12rem] flex-1 overflow-hidden rounded-md border border-hairline">
          {seniorGrow > 0 && (
            <div
              style={{ flexGrow: seniorGrow, flexBasis: 0 }}
              className="flex min-w-0 items-center justify-center gap-3 bg-tessolve-navy px-3 font-semibold text-white"
            >
              <span className="truncate">Senior</span>
              <span className="shrink-0">{balance.senior}</span>
            </div>
          )}
          {juniorGrow > 0 && (
            <div
              style={{ flexGrow: juniorGrow, flexBasis: 0 }}
              className="flex min-w-0 items-center justify-center gap-3 bg-tessolve-blue px-3 font-semibold text-tessolve-navy"
            >
              <span className="truncate">Junior</span>
              <span className="shrink-0">{balance.junior}</span>
            </div>
          )}
        </div>
        <p className="type-secondary">
          {balance.ratio === null
            ? 'No juniors in this view.'
            : `${balance.senior} senior to ${balance.junior} junior (${balance.ratio} to 1).`}
        </p>
      </div>
      <h3 className="type-title mt-6">Org exceptions</h3>
      {issues.length === 0 ? (
        <p className="type-secondary mt-3">No org exceptions in this view.</p>
      ) : (
        <ul className="mt-3">
          {issues.map((issue) => (
            <li key={issue} className="border-b border-hairline py-3">
              {issue}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div>
          <h3 className="type-title">Readiness by role</h3>
          <div className="mt-3">
            <MixBars
              data={funnel}
              empty="No roles in view."
              label="Readiness by role. Ready, Watch, and At risk for each role."
              onName={toggleRole}
              plotClass="h-56"
            />
          </div>
        </div>
        <div>
          <h3 className="type-title">Mentor span</h3>
          <div className="mt-3">
            <MixBars
              data={mentors}
              empty="No mentors in view."
              label="Mentor span. Ready, Watch, and At risk mentees for each mentor."
              plotClass="h-56"
            />
          </div>
        </div>
        <div>
          <h3 className="type-title">Span of control</h3>
          <div
            className="mt-3 h-56"
            role="group"
            aria-label="Span of control for leaders with direct reports."
          >
            {leaders.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center type-secondary">
                No leaders with reports in this view.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaders} layout="vertical" margin={CHART_MARGIN}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={108} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="score" name="Score" radius={[0, 4, 4, 0]}>
                    {leaders.map((row) => (
                      <Cell key={row.id} fill={scoreFill(row.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </section>
    </div>
  )
}
