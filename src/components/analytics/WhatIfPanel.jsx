import { useMemo, useState } from 'react'
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
    <section className="py-6">
      <h3 className="type-title">Attrition scenario</h3>
      <p className="type-secondary mt-3 mb-3">
        Multi-select people to depart; preview RAG deltas before applying.
      </p>

      <div className="mb-3 flex max-h-40 flex-wrap gap-3 overflow-y-auto">
        {candidates.map((e) => {
          const on = selected.has(e.Employee_Name)
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => toggle(e.Employee_Name)}
              className={`hit px-3 ${
                on
                  ? 'font-semibold text-tessolve-navy underline decoration-2 underline-offset-4'
                  : 'type-secondary hover:text-tessolve-navy'
              }`}
            >
              {e.Employee_Name}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={runPreview}
          className="hit rounded-md border border-hairline bg-white px-3 font-medium text-ink"
        >
          Preview deltas
        </button>
        <button
          type="button"
          disabled={!selected.size || applying}
          onClick={apply}
          className="hit rounded-md bg-tessolve-navy px-3 font-semibold text-white disabled:opacity-50"
        >
          Apply
        </button>
      </div>

      {preview && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            RAG changes ({preview.deltas?.length || 0})
          </p>
          {!preview.deltas?.length ? (
            <p className="mt-2 text-sm text-slate-500">
              No RAG status changes for this selection.
            </p>
          ) : (
            <ul className="mt-2">
              {preview.deltas.map((d) => (
                <li
                  key={d.id}
                  className="border-b border-slate-100 py-1.5 text-sm text-slate-700"
                >
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
    </section>
  )
}
