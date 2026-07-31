import { useEffect, useMemo, useState } from 'react'
import { X, Pencil, Check, Ban } from 'lucide-react'
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

const PROJECT_TYPES = ['FT', 'WS', 'NPI', 'Sustaining', 'HVM Support', 'Other']

const fieldClass =
  'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 shadow-sm transition focus:border-tessolve-blue focus:outline-none focus:ring-2 focus:ring-tessolve-blue/20'

const EDITABLE_KEYS = [
  'Role',
  'Reports_To',
  'Mentor_Name',
  'Client',
  'Project_Type',
  'Allocation_Status',
  'Billing_Months_Remaining',
  'Upcoming_Commitment',
  ...Object.keys(ENUM_COLUMNS).filter((k) => k !== 'Allocation_Status'),
  'TML_Scripting',
  'CS_ES_HVM_Releases',
  ...BOOLEAN_COLUMNS,
]

function snapshotEmployee(emp) {
  const snap = {}
  for (const key of EDITABLE_KEYS) {
    snap[key] = emp[key]
  }
  snap.isDeparted = Boolean(emp.isDeparted)
  return snap
}

function radarAxes(emp) {
  return [
    { skill: 'SMT', value: emp.Max_V93k ?? 0 },
    { skill: 'Other', value: emp.Other_Testers ? 8 : 0 },
    { skill: 'CONT', value: CONT_MAP[emp.CONT_Status] ?? 0 },
    { skill: 'DBD', value: emp.DBD_Bringup ? 8 : 0 },
    { skill: 'SC', value: emp.SC_Experience ? 8 : 0 },
    { skill: 'SOD', value: emp.SOD_Handling ? 8 : 0 },
    { skill: 'Product', value: PRODUCT_MAP[emp.Product_Focus] ?? 0 },
    { skill: 'Demand', value: DEMAND_MAP[emp.Client_Demand] ?? 0 },
    { skill: 'Proj', value: emp.Project_Projections_Current ? 8 : 0 },
    { skill: 'TML', value: Number(emp.TML_Scripting) || 0 },
    { skill: 'HVM', value: Number(emp.CS_ES_HVM_Releases) || 0 },
    { skill: 'IP', value: IP_MAP[emp.IP_Debug_Level] ?? 0 },
  ]
}

function Fact({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2">
      <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-slate-800">{value || '—'}</p>
    </div>
  )
}

export default function EmployeeSidebar() {
  const {
    selectedEmployee,
    setSelectedEmployeeId,
    commitEmployeeUpdate,
    selectEmployeeByName,
    filterOptions,
    employees,
    persistStatus,
  } = useApp()

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setEditing(false)
    setDraft(null)
  }, [selectedEmployee?.id])

  useEffect(() => {
    if (!selectedEmployee) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (editing) {
          setEditing(false)
          setDraft(null)
        } else {
          setSelectedEmployeeId(null)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedEmployee, setSelectedEmployeeId, editing])

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
  const setField = (key, value) =>
    setDraft((prev) => ({ ...(prev || {}), [key]: value }))

  const startEdit = () => {
    setDraft(snapshotEmployee(emp))
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraft(null)
  }

  const saveEdit = async () => {
    if (!draft) return
    setSaving(true)
    try {
      await commitEmployeeUpdate(emp.id, { ...draft })
      setEditing(false)
      setDraft(null)
    } finally {
      setSaving(false)
    }
  }

  const d = editing ? draft : null

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[1px] transition"
        onClick={() => setSelectedEmployeeId(null)}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-tessolve-navy">
              {emp.Employee_Name}
            </h2>
            <p className="text-sm text-slate-500">
              {emp.Role} · {emp.Client}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <RagBadge status={emp.ragStatus} human />
              {persistStatus && (
                <span className="text-[11px] text-slate-400">{persistStatus}</span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {!editing ? (
              <button
                type="button"
                onClick={startEdit}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-tessolve-navy shadow-sm transition hover:border-tessolve-orange hover:text-tessolve-orange"
              >
                <Pencil size={13} />
                Edit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={saveEdit}
                  className="inline-flex items-center gap-1 rounded-lg bg-tessolve-orange px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-tessolve-orange-dark disabled:opacity-60"
                >
                  <Check size={13} />
                  Save
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <Ban size={13} />
                  Cancel
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setSelectedEmployeeId(null)}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:text-slate-800"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-4 gap-1.5 text-center text-sm">
            <div className="rounded-lg bg-slate-50 px-1 py-1.5">
              <p className="text-[9px] text-slate-400 uppercase">Overall</p>
              <p className="font-mono text-slate-800">{emp.Overall_Score}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-1 py-1.5">
              <p className="text-[9px] text-slate-400 uppercase">Plat</p>
              <p className="font-mono text-slate-800">{emp.Platform_Score}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-1 py-1.5">
              <p className="text-[9px] text-slate-400 uppercase">Deliv</p>
              <p className="font-mono text-slate-800">{emp.Delivery_Score}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-1 py-1.5">
              <p className="text-[9px] text-slate-400 uppercase">Depth</p>
              <p className="font-mono text-slate-800">{emp.Depth_Score}</p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Skill profile
            </h3>
            <div className="h-44 w-full rounded-xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 shadow-inner">
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

          {!editing ? (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Profile
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2">
                  <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                    Reports to
                  </p>
                  {emp.Reports_To ? (
                    <button
                      type="button"
                      className="mt-0.5 text-sm text-tessolve-blue hover:underline"
                      onClick={() => selectEmployeeByName(emp.Reports_To)}
                    >
                      {emp.Reports_To}
                    </button>
                  ) : (
                    <p className="mt-0.5 text-sm text-slate-800">—</p>
                  )}
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2">
                  <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                    Mentor
                  </p>
                  {emp.Mentor_Name ? (
                    <button
                      type="button"
                      className="mt-0.5 text-sm text-tessolve-blue hover:underline"
                      onClick={() => selectEmployeeByName(emp.Mentor_Name)}
                    >
                      {emp.Mentor_Name}
                    </button>
                  ) : (
                    <p className="mt-0.5 text-sm text-slate-800">—</p>
                  )}
                </div>
                <Fact label="Project type" value={emp.Project_Type} />
                <Fact
                  label="Allocation"
                  value={
                    emp.Allocation_Status === 'Bench' ? 'On bench' : 'On project'
                  }
                />
                <Fact
                  label="Billing months left"
                  value={emp.Billing_Months_Remaining ?? 0}
                />
                <Fact
                  label="Upcoming commitment"
                  value={emp.Upcoming_Commitment || '—'}
                />
                <Fact label="SMT" value={emp.SMT_Versions_Known} />
                <Fact label="CONT" value={emp.CONT_Status} />
                <Fact label="Product" value={emp.Product_Focus} />
                <Fact label="IP debug" value={emp.IP_Debug_Level} />
                <Fact label="Demand" value={emp.Client_Demand} />
                <Fact
                  label="SC experience"
                  value={emp.SC_Experience ? 'Yes' : 'No'}
                />
                <Fact
                  label="SOD handling"
                  value={emp.SOD_Handling ? 'Yes' : 'No'}
                />
                <Fact label="TML" value={emp.TML_Scripting} />
                <Fact label="HVM" value={emp.CS_ES_HVM_Releases} />
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
              {emp.isDeparted && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Marked departed — attrition cascade applied
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Edit details
              </h3>

              <label className="block text-xs text-slate-500">
                Role
                <select
                  className={`mt-1 ${fieldClass}`}
                  value={d.Role}
                  onChange={(e) => setField('Role', e.target.value)}
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
                  value={d.Reports_To || ''}
                  onChange={(e) => setField('Reports_To', e.target.value)}
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
                  value={d.Mentor_Name || ''}
                  onChange={(e) => setField('Mentor_Name', e.target.value)}
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
                  value={d.Client}
                  onChange={(e) => setField('Client', e.target.value)}
                >
                  {[
                    ...new Set([
                      d.Client,
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
                Project type (FT and WS are distinct)
                <select
                  className={`mt-1 ${fieldClass}`}
                  value={
                    PROJECT_TYPES.includes(d.Project_Type)
                      ? d.Project_Type
                      : 'Other'
                  }
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === 'Other') setField('Project_Type', d.Project_Type || '')
                    else setField('Project_Type', v)
                  }}
                >
                  {PROJECT_TYPES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {(!PROJECT_TYPES.includes(d.Project_Type) ||
                  d.Project_Type === 'Other') && (
                  <input
                    className={`mt-1 ${fieldClass}`}
                    placeholder="Custom project type"
                    value={
                      PROJECT_TYPES.includes(d.Project_Type) &&
                      d.Project_Type !== 'Other'
                        ? ''
                        : d.Project_Type || ''
                    }
                    onChange={(e) => setField('Project_Type', e.target.value)}
                  />
                )}
              </label>

              <label className="block text-xs text-slate-500">
                Allocation
                <select
                  className={`mt-1 ${fieldClass}`}
                  value={d.Allocation_Status || 'Project'}
                  onChange={(e) => setField('Allocation_Status', e.target.value)}
                >
                  <option value="Project">On project</option>
                  <option value="Bench">On bench</option>
                </select>
              </label>

              <label className="block text-xs text-slate-500">
                Billing months remaining
                <input
                  type="number"
                  min={0}
                  className={`mt-1 ${fieldClass}`}
                  value={d.Billing_Months_Remaining ?? 0}
                  onChange={(e) =>
                    setField(
                      'Billing_Months_Remaining',
                      Number(e.target.value) || 0,
                    )
                  }
                />
              </label>

              <label className="block text-xs text-slate-500">
                Upcoming commitment
                <input
                  className={`mt-1 ${fieldClass}`}
                  value={d.Upcoming_Commitment || ''}
                  onChange={(e) =>
                    setField('Upcoming_Commitment', e.target.value)
                  }
                />
              </label>

              {Object.entries(ENUM_COLUMNS)
                .filter(([col]) => col !== 'Allocation_Status')
                .map(([col, options]) => (
                <label key={col} className="block text-xs text-slate-500">
                  {col.replace(/_/g, ' ')}
                  <select
                    className={`mt-1 ${fieldClass}`}
                    value={d[col]}
                    onChange={(e) => setField(col, e.target.value)}
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
                  value={d.TML_Scripting ?? 0}
                  onChange={(e) =>
                    setField('TML_Scripting', Number(e.target.value) || 0)
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
                  value={d.CS_ES_HVM_Releases ?? 0}
                  onChange={(e) =>
                    setField('CS_ES_HVM_Releases', Number(e.target.value) || 0)
                  }
                />
              </label>

              <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                {BOOLEAN_COLUMNS.map((col) => (
                  <label
                    key={col}
                    className="flex items-center justify-between gap-2 text-xs text-slate-600"
                  >
                    <span>{col.replace(/_/g, ' ')}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(d[col])}
                      onChange={(e) => setField(col, e.target.checked)}
                    />
                  </label>
                ))}
                <label className="flex items-center justify-between gap-2 text-xs text-slate-600">
                  <span>Departed</span>
                  <input
                    type="checkbox"
                    checked={Boolean(d.isDeparted)}
                    onChange={(e) => setField('isDeparted', e.target.checked)}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
