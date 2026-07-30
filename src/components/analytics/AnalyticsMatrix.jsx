import { useMemo } from 'react'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts'
import { useApp } from '../../context/AppContext'
import ClientRiskPanel from '../risk/ClientRiskPanel'
import { SKILL_COLUMNS } from '../../utils/csvSchema'

const SKILL_LABELS = {
  Smartest_V7: 'V7',
  Smartest_V8: 'V8',
  Test_Program_Integration: 'TP Int',
  Test_Program_Development: 'TP Dev',
  Pattern_Debugs: 'Patterns',
  Scripting_Tools: 'Scripting',
  Data_Analytics: 'Analytics',
  Version_Control_Git: 'Git',
  IP_Knowledge: 'IP',
  Post_Silicon_Validation: 'PSV',
  Bench_Setup_Stabilization: 'Bench',
  Loadboard_Bringup: 'Loadboard',
  HW_Validation: 'HW Val',
  GRR_Analysis: 'GRR',
  Engineering_Bringups: 'Eng Bringup',
  Multisite_Bringup: 'Multisite',
  TapeOut_To_HVM: 'TO→HVM',
  Volume_KPI_Analysis: 'Vol KPI',
  Production_Release_Track: 'Prod Rel',
}

const RAG_COLORS = {
  GREEN: '#16A34A',
  AMBER: '#D97706',
  RED: '#DC2626',
}

export default function AnalyticsMatrix() {
  const { filteredEmployees, clientRisk, filters } = useApp()

  const active = useMemo(
    () => filteredEmployees.filter((e) => !e.isDeparted),
    [filteredEmployees],
  )

  const radarData = useMemo(() => {
    if (!active.length) return []
    return SKILL_COLUMNS.map((col) => {
      const sum = active.reduce((acc, e) => acc + (Number(e[col]) || 0), 0)
      return {
        skill: SKILL_LABELS[col] || col,
        average: Math.round((sum / active.length) * 100) / 100,
      }
    })
  }, [active])

  const ragBarData = useMemo(() => {
    const counts = { GREEN: 0, AMBER: 0, RED: 0 }
    for (const e of active) {
      if (counts[e.ragStatus] !== undefined) counts[e.ragStatus] += 1
    }
    return [
      { name: 'Green', value: counts.GREEN, fill: RAG_COLORS.GREEN },
      { name: 'Amber', value: counts.AMBER, fill: RAG_COLORS.AMBER },
      { name: 'Red', value: counts.RED, fill: RAG_COLORS.RED },
    ]
  }, [active])

  const scoreBarData = useMemo(() => {
    if (!active.length) return []
    const avg = (key) =>
      Math.round(
        (active.reduce((s, e) => s + (Number(e[key]) || 0), 0) / active.length) *
          100,
      ) / 100
    return [
      { name: 'Max V93k', value: avg('Max_V93k'), fill: '#F2802B' },
      { name: 'Lab', value: avg('Lab_Score'), fill: '#23A6E3' },
      { name: 'Process', value: avg('Process_Score'), fill: '#64748b' },
      { name: 'Overall', value: avg('Overall_Score'), fill: '#0f172a' },
    ]
  }, [active])

  const clientFilterNote =
    filters.client !== 'All' ? ` · filtered to ${filters.client}` : ''

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pb-10 sm:px-6">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          Analytics Matrix
        </h2>
        <p className="text-sm text-slate-500">
          Skill distributions and RAG mix{clientFilterNote} · {active.length}{' '}
          active engineers
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 font-display font-semibold text-slate-800">
            Skill Averages (Radar)
          </h3>
          <div className="h-80 w-full">
            {radarData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-slate-500">
                No data
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 10]}
                    tick={{ fontSize: 10 }}
                  />
                  <Radar
                    name="Avg Skill"
                    dataKey="average"
                    stroke="#F2802B"
                    fill="#23A6E3"
                    fillOpacity={0.35}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 font-display font-semibold text-slate-800">
            RAG Distribution
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ragBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {ragBarData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h3 className="mb-2 font-display font-semibold text-slate-800">
            Composite Score Averages
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreBarData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Average" radius={[0, 6, 6, 0]}>
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
        <h3 className="mb-3 font-display text-lg font-semibold text-slate-900">
          Client Health & SPOF
        </h3>
        <ClientRiskPanel
          clients={clientRisk.clients}
          spofAlerts={clientRisk.spofAlerts}
        />
      </div>
    </div>
  )
}
