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
  Legend,
} from 'recharts'
import { useApp } from '../../context/AppContext'
import RagBadge from '../common/RagBadge'
import { mergePersonTeamRadar, snapshotEmployee } from './employeeSidebarShared'
import EmployeeSidebarView from './EmployeeSidebarView'
import EmployeeSidebarEdit from './EmployeeSidebarEdit'

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
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    setEditing(false)
    setDraft(null)
    setSaveError('')
  }, [selectedEmployee?.id])

  useEffect(() => {
    if (!selectedEmployee) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (editing) {
          setEditing(false)
          setDraft(null)
          setSaveError('')
        } else {
          setSelectedEmployeeId(null)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedEmployee, setSelectedEmployeeId, editing])

  const radarData = useMemo(
    () =>
      selectedEmployee
        ? mergePersonTeamRadar(selectedEmployee, employees)
        : [],
    [selectedEmployee, employees],
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
    setSaveError('')
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraft(null)
    setSaveError('')
  }

  const saveEdit = async () => {
    if (!draft) return
    setSaving(true)
    setSaveError('')
    try {
      const outcome = await commitEmployeeUpdate(emp.id, { ...draft })
      if (outcome && outcome.ok === false) {
        setSaveError(outcome.reason || 'Could not save changes')
        return
      }
      setEditing(false)
      setDraft(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        className="fixed inset-0 z-40 bg-slate-900/35 backdrop-blur-[1px] transition"
        onClick={() => setSelectedEmployeeId(null)}
      />
      <aside
        className="sheet fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-sidebar-title"
      >
        <div className="flex items-start justify-between gap-6 border-b border-hairline px-6 py-6">
          <div className="min-w-0">
            <h2
              id="employee-sidebar-title"
              className="type-title"
            >
              {emp.Employee_Name}
            </h2>
            <p className="type-secondary mt-3">
              {emp.Role} · {emp.Client}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <RagBadge status={emp.ragStatus} human />
              {persistStatus && (
                <span className="type-secondary">{persistStatus}</span>
              )}
            </div>
            {saveError && (
              <p className="mt-2 text-xs text-rag-red" role="alert">
                {saveError}
              </p>
            )}
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
              aria-label="Close employee details"
              onClick={() => setSelectedEmployeeId(null)}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:text-slate-800"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <div className="flex border-y border-hairline text-center">
            {[
              ['Overall', emp.Overall_Score],
              ['Plat', emp.Platform_Score],
              ['Deliv', emp.Delivery_Score],
              ['Depth', emp.Depth_Score],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={`flex-1 py-1.5 ${index > 0 ? 'border-l border-slate-200' : ''}`}
              >
                <p className="type-secondary">{label}</p>
                <p className="font-mono text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="type-title mb-3">
              Skill vs team mean
            </h3>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fontSize: 11, fill: '#3D4F63' }}
                  />
                  <PolarRadiusAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Radar
                    name="Team avg"
                    dataKey="team"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.15}
                  />
                  <Radar
                    name="Person"
                    dataKey="person"
                    stroke="#F2802B"
                    fill="#23A6E3"
                    fillOpacity={0.35}
                  />
                  <Tooltip />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    iconSize={10}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {!editing ? (
            <EmployeeSidebarView
              emp={emp}
              selectEmployeeByName={selectEmployeeByName}
            />
          ) : (
            <EmployeeSidebarEdit
              draft={draft}
              setField={setField}
              nameOptions={nameOptions}
              filterOptions={filterOptions}
            />
          )}
        </div>
      </aside>
    </>
  )
}
