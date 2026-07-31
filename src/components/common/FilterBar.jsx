import { useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { RAG_LABELS } from '../../utils/csvSchema'

export default function FilterBar() {
  const location = useLocation()
  const {
    filters,
    setFilters,
    filterOptions,
    clearFilters,
    activeFilterCount,
    filteredEmployees,
  } = useApp()

  const onOrg = location.pathname.includes('/org')

  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const selectClass =
    'min-w-[110px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-sm focus:border-tessolve-blue focus:outline-none'

  const chips = []
  if (filters.client !== 'All') {
    chips.push({ key: 'client', label: filters.client })
  }
  if (filters.role !== 'All') {
    chips.push({ key: 'role', label: filters.role })
  }
  if (filters.rag !== 'All') {
    chips.push({
      key: 'rag',
      label: RAG_LABELS[filters.rag] || filters.rag,
    })
  }
  if (filters.allocation !== 'All') {
    chips.push({
      key: 'allocation',
      label: filters.allocation === 'Bench' ? 'On bench' : 'On project',
    })
  }
  if (onOrg && filters.person && filters.person !== 'All') {
    chips.push({ key: 'person', label: filters.person })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        {onOrg && (
          <label className="flex flex-col gap-0.5 text-[10px] font-medium tracking-wide text-slate-500 uppercase">
            Org focus
            <select
              value={filters.person || 'All'}
              onChange={(e) => update('person', e.target.value)}
              className={selectClass}
            >
              <option value="All">All people</option>
              {filterOptions.people?.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-0.5 text-[10px] font-medium tracking-wide text-slate-500 uppercase">
          Client
          <select
            value={filters.client}
            onChange={(e) => update('client', e.target.value)}
            className={selectClass}
          >
            <option value="All">All</option>
            {filterOptions.clients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-0.5 text-[10px] font-medium tracking-wide text-slate-500 uppercase">
          Role
          <select
            value={filters.role}
            onChange={(e) => update('role', e.target.value)}
            className={selectClass}
          >
            <option value="All">All</option>
            {filterOptions.roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-0.5 text-[10px] font-medium tracking-wide text-slate-500 uppercase">
          Status
          <select
            value={filters.rag}
            onChange={(e) => update('rag', e.target.value)}
            className={selectClass}
          >
            <option value="All">All</option>
            <option value="GREEN">Ready</option>
            <option value="AMBER">Watch</option>
            <option value="RED">At risk</option>
          </select>
        </label>

        <label className="flex flex-col gap-0.5 text-[10px] font-medium tracking-wide text-slate-500 uppercase">
          Allocation
          <select
            value={filters.allocation || 'All'}
            onChange={(e) => update('allocation', e.target.value)}
            className={selectClass}
          >
            <option value="All">All</option>
            <option value="Project">On project</option>
            <option value="Bench">On bench</option>
          </select>
        </label>

        <p className="pb-1.5 text-xs text-slate-500">
          Showing {filteredEmployees.length} people
        </p>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => update(chip.key, 'All')}
              className="inline-flex items-center gap-1 rounded-full border border-tessolve-blue/30 bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-tessolve-navy transition hover:border-tessolve-orange"
            >
              {chip.label}
              <X size={11} />
            </button>
          ))}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] font-semibold text-tessolve-orange hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  )
}
