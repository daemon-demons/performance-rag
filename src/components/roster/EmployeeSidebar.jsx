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
import { radarAxes, snapshotEmployee } from './employeeSidebarShared'
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
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-sidebar-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
          <div className="min-w-0">
            <h2
              id="employee-sidebar-title"
              className="font-display text-lg font-semibold text-tessolve-navy"
            >
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
