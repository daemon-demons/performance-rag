import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import { useApp } from '../../context/AppContext'
import ClientRiskPanel from '../risk/ClientRiskPanel'

const RAG_COLORS = {
  Green: '#16A34A',
  Amber: '#D97706',
  Red: '#DC2626',
}

export default function DashboardView() {
  const { filteredEmployees, clientRisk, filters, kpis } = useApp()

  const active = useMemo(
    () => filteredEmployees.filter((e) => !e.isDeparted),
    [filteredEmployees],
  )

  const ragBarData = useMemo(() => {
    const counts = { Green: 0, Amber: 0, Red: 0 }
    for (const e of active) {
      if (e.ragStatus === 'GREEN') counts.Green += 1
      else if (e.ragStatus === 'AMBER') counts.Amber += 1
      else if (e.ragStatus === 'RED') counts.Red += 1
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [active])

  const scoreBarData = useMemo(() => {
    if (!active.length) return []
    const avg = (key) =>
      Math.round(
        (active.reduce((s, e) => s + (Number(e[key]) || 0), 0) / active.length) *
          100,
      ) / 100
    return [
      { name: 'SMT (93k)', value: avg('Max_V93k'), fill: '#F2802B' },
      { name: 'Platform', value: avg('Platform_Score'), fill: '#23A6E3' },
      { name: 'Delivery', value: avg('Delivery_Score'), fill: '#64748b' },
      { name: 'Depth', value: avg('Depth_Score'), fill: '#94a3b8' },
      { name: 'Overall', value: avg('Overall_Score'), fill: '#0f172a' },
    ]
  }, [active])

  const note =
    filters.client !== 'All' ? ` · filtered to ${filters.client}` : ''

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-10 sm:px-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-tessolve-navy">
          Dashboard
        </h2>
        <p className="text-sm text-slate-500">
          Team health overview{note} · {active.length} active · {kpis.departed}{' '}
          departed
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-plush">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            RAG distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ragBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {ragBarData.map((entry) => (
                    <Cell key={entry.name} fill={RAG_COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-plush">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Average skill scores
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreBarData} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={72}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {scoreBarData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-700">
          Client health & SPOF
        </h3>
        <ClientRiskPanel
          clients={clientRisk.clients}
          spofAlerts={clientRisk.spofAlerts}
        />
      </div>
    </div>
  )
}
