import { useMemo, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function WhatIfPanel() {
  const { employees, previewAttrition, applyAttritionPreview } = useApp()
  const [selected, setSelected] = useState(() => new Set())
  const [preview, setPreview] = useState(null)
  const [applying, setApplying] = useState(false)

  const candidates = useMemo(
    () =>
      employees
        .filter((e) => !e.isDeparted)
        .slice()
        .sort((a, b) => a.Employee_Name.localeCompare(b.Employee_Name)),
    [employees],
  )

  const toggle = (name) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
    setPreview(null)
  }

  const runPreview = () => {
    const names = [...selected]
    if (!names.length) {
      setPreview({ deltas: [] })
      return
    }
    setPreview(previewAttrition(names))
  }

  const apply = async () => {
    setApplying(true)
    try {
      await applyAttritionPreview([...selected])
      setSelected(new Set())
      setPreview(null)
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="card-plush">
      <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
        <FlaskConical size={15} className="text-tessolve-orange" />
        What-if attrition simulator
      </h3>
      <p className="mb-3 text-xs text-slate-500">
        Multi-select people to depart; preview RAG deltas before applying.
      </p>

      <div className="mb-3 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
        {candidates.map((e) => {
          const on = selected.has(e.Employee_Name)
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => toggle(e.Employee_Name)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                on
                  ? 'border-tessolve-orange bg-orange-50 text-tessolve-orange'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {e.Employee_Name}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={runPreview}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-tessolve-blue"
        >
          Preview deltas
        </button>
        <button
          type="button"
          disabled={!selected.size || applying}
          onClick={apply}
          className="rounded-lg bg-tessolve-navy px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-tessolve-navy-mid disabled:opacity-50"
        >
          Apply & save CSV
        </button>
      </div>

      {preview && (
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            RAG changes ({preview.deltas?.length || 0})
          </p>
          {!preview.deltas?.length ? (
            <p className="mt-2 text-sm text-slate-500">
              No RAG status changes for this selection.
            </p>
          ) : (
            <ul className="mt-2 space-y-1">
              {preview.deltas.map((d) => (
                <li key={d.id} className="text-sm text-slate-700">
                  <span className="font-medium">{d.name}</span>{' '}
                  <span className="font-mono text-xs text-slate-500">
                    {d.from} → {d.to}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
