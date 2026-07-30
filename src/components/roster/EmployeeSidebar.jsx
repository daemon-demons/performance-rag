import { useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts'
import { useApp } from '../../context/AppContext'
import RagBadge from '../common/RagBadge'
import { ENUM_COLUMNS, BOOLEAN_COLUMNS } from '../../utils/csvSchema'

const CONT_MAP = { Bringup: 8, Debug: 5, No_Idea: 1 }
const PRODUCT_MAP = { NPI: 7, Sustaining: 6, Both: 9 }
const IP_MAP = { None: 2, Basic: 5, Advanced: 9 }
const DEMAND_MAP = { Low: 4, Medium: 6, High: 9 }

const ROLES = [
  'Intern',
  'Eng 1',
  'Eng 2',
  'Sr Eng 1',
  'Sr Eng 2',
  'Lead',
  'Sr Lead',
  'Manager',
  'Staff',
]

const fieldClass =
  'w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-tessolve-blue focus:outline-none'

function radarAxes(emp) {
  return [
    { skill: 'SMT', value: emp.Max_V93k ?? 0 },
    { skill: 'Other', value: emp.Other_Testers ? 8 : 0 },
    { skill: 'CONT', value: CONT_MAP[emp.CONT_Status] ?? 0 },
    { skill: 'DBD', value: emp.DBD_Bringup ? 8 : 0 },
    { skill: 'SC/WS', value: emp.Handled_SC_WS ? 8 : 0 },
    { skill: 'SOD/FT', value: emp.Handled_SOD_FT ? 8 : 0 },
    { skill: 'Product', value: PRODUCT_MAP[emp.Product_Focus] ?? 0 },
    { skill: 'Demand', value: DEMAND_MAP[emp.Client_Demand] ?? 0 },
    { skill: 'Proj', value: emp.Project_Projections_Current ? 8 : 0 },
    { skill: 'TML', value: Number(emp.TML_Scripting) || 0 },
    { skill: 'HVM', value: Number(emp.CS_ES_HVM_Releases) || 0 },
    { skill: 'IP', value: IP_MAP[emp.IP_Debug_Level] ?? 0 },
  ]
}

export default function EmployeeSidebar() {
  const {
    selectedEmployee,
    setSelectedEmployeeId,
    updateEmployee,
    reassignReport,
    toggleDeparted,
    filterOptions,
    employees,
  } = useApp()

  useEffect(() => {
    if (!selectedEmployee) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedEmployeeId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedEmployee, setSelectedEmployeeId])

  const radarData = useMemo(
    () => (selectedEmployee ? radarAxes(selectedEmployee) : []),
    [selectedEmployee],
  )

  const nameOptions = useMemo(
    () =>
      employees
        .map((e) => e.Employee_Name)
        .filter((n) => n && n !== selectedEmployee?.Employee_Name)
        .sort((a, b) => a.localeCompare(b)),
    [employees, selectedEmployee],
  )

  if (!selectedEmployee) return null

  const emp = selectedEmployee
  const patch = (key, value) => updateEmployee(emp.id, { [key]: value })

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        className="fixed inset-0 z-40 bg-slate-900/30"
        onClick={() => setSelectedEmployeeId(null)}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-tessolve-navy">
              {emp.Employee_Name}
            </h2>
            <p className="text-sm text-slate-500">
              {emp.Role} · {emp.Client}
            </p>
            <div className="mt-2">
              <RagBadge status={emp.ragStatus} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedEmployeeId(null)}
            className="rounded border border-slate-200 p-1.5 text-slate-500 hover:text-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded border border-slate-100 bg-slate-50 px-2 py-2">
              <p className="text-[10px] text-slate-400 uppercase">Overall</p>
              <p className="font-mono text-slate-800">{emp.Overall_Score}</p>
            </div>
            <div className="rounded border border-slate-100 bg-slate-50 px-2 py-2">
              <p className="text-[10px] text-slate-400 uppercase">Platform</p>
              <p className="font-mono text-slate-800">{emp.Platform_Score}</p>
            </div>
            <div className="rounded border border-slate-100 bg-slate-50 px-2 py-2">
              <p className="text-[10px] text-slate-400 uppercase">Delivery</p>
              <p className="font-mono text-slate-800">{emp.Delivery_Score}</p>
            </div>
            <div className="rounded border border-slate-100 bg-slate-50 px-2 py-2">
              <p className="text-[10px] text-slate-400 uppercase">Depth</p>
              <p className="font-mono text-slate-800">{emp.Depth_Score}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Skill profile
            </h3>
            <div className="h-56 w-full rounded border border-slate-100">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fontSize: 9, fill: '#64748b' }}
                  />
                  <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 9 }} />
                  <Radar
                    name="Skills"
                    dataKey="value"
                    stroke="#F2802B"
                    fill="#23A6E3"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Edit
            </h3>

            <label className="block text-xs text-slate-500">
              Role
              <select
                className={`mt-1 ${fieldClass}`}
                value={emp.Role}
                onChange={(e) => patch('Role', e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs text-slate-500">
              Reports to
              <select
                className={`mt-1 ${fieldClass}`}
                value={emp.Reports_To || ''}
                onChange={(e) => {
                  const v = e.target.value
                  if (!v) {
                    patch('Reports_To', '')
                    return
                  }
                  reassignReport(emp.id, v)
                }}
              >
                <option value="">— None —</option>
                {nameOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs text-slate-500">
              Mentor
              <select
                className={`mt-1 ${fieldClass}`}
                value={emp.Mentor_Name || ''}
                onChange={(e) => patch('Mentor_Name', e.target.value)}
              >
                <option value="">— None —</option>
                {nameOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs text-slate-500">
              Client
              <select
                className={`mt-1 ${fieldClass}`}
                value={emp.Client}
                onChange={(e) => patch('Client', e.target.value)}
              >
                {[
                  ...new Set([
                    emp.Client,
                    'Client Q',
                    'Client A',
                    'Client G',
                    ...(filterOptions.clients || []),
                  ]),
                ]
                  .filter(Boolean)
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </label>

            <label className="block text-xs text-slate-500">
              Project type
              <input
                className={`mt-1 ${fieldClass}`}
                value={emp.Project_Type || ''}
                onChange={(e) => patch('Project_Type', e.target.value)}
              />
            </label>

            {Object.entries(ENUM_COLUMNS).map(([col, options]) => (
              <label key={col} className="block text-xs text-slate-500">
                {col.replace(/_/g, ' ')}
                <select
                  className={`mt-1 ${fieldClass}`}
                  value={emp[col]}
                  onChange={(e) => patch(col, e.target.value)}
                >
                  {options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            ))}

            <label className="block text-xs text-slate-500">
              TML Scripting (0–10)
              <input
                type="number"
                min={0}
                max={10}
                className={`mt-1 ${fieldClass}`}
                value={emp.TML_Scripting ?? 0}
                onChange={(e) =>
                  patch('TML_Scripting', Number(e.target.value) || 0)
                }
              />
            </label>

            <label className="block text-xs text-slate-500">
              CS/ES HVM Releases (0–10)
              <input
                type="number"
                min={0}
                max={10}
                className={`mt-1 ${fieldClass}`}
                value={emp.CS_ES_HVM_Releases ?? 0}
                onChange={(e) =>
                  patch('CS_ES_HVM_Releases', Number(e.target.value) || 0)
                }
              />
            </label>

            <div className="space-y-2 rounded border border-slate-100 p-3">
              {BOOLEAN_COLUMNS.map((col) => (
                <label
                  key={col}
                  className="flex items-center justify-between gap-2 text-xs text-slate-600"
                >
                  <span>{col.replace(/_/g, ' ')}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(emp[col])}
                    onChange={(e) => patch(col, e.target.checked)}
                  />
                </label>
              ))}
              <label className="flex items-center justify-between gap-2 text-xs text-slate-600">
                <span>Departed</span>
                <input
                  type="checkbox"
                  checked={Boolean(emp.isDeparted)}
                  onChange={() => toggleDeparted(emp.id)}
                />
              </label>
            </div>

            {emp.failedResponsibilities?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Failed responsibilities
                </p>
                <ul className="mt-1 list-disc pl-4 text-xs text-rag-red">
                  {emp.failedResponsibilities.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
