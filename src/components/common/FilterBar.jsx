import { useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { RAG_LABELS } from '../../utils/csvSchema'

const CHIP_CLASS = {
  client: 'border-tessolve-navy text-tessolve-navy',
  role: 'border-hairline text-ink',
  GREEN: 'border-status-ready text-status-ready',
  AMBER: 'border-status-watch text-status-watch',
  RED: 'border-status-risk text-status-risk',
  allocation: 'border-tessolve-navy text-tessolve-navy',
  person: 'border-tessolve-navy text-tessolve-navy',
}

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
    'hit min-w-[6.5rem] rounded-md border border-hairline bg-white px-3 text-ink'

  const chips = []
  if (filters.client !== 'All') {
    chips.push({ key: 'client', label: filters.client, tone: 'client' })
  }
  if (filters.role !== 'All') {
    chips.push({ key: 'role', label: filters.role, tone: 'role' })
  }
  if (filters.rag !== 'All') {
    chips.push({
      key: 'rag',
      label: RAG_LABELS[filters.rag] || filters.rag,
      tone: filters.rag,
    })
  }
  if (filters.allocation !== 'All') {
    chips.push({
      key: 'allocation',
      label: filters.allocation === 'Bench' ? 'On bench' : 'On project',
      tone: 'allocation',
    })
  }
  if (filters.person && filters.person !== 'All') {
    chips.push({ key: 'person', label: filters.person, tone: 'person' })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {onOrg && (
        <select
          aria-label="Org focus"
          value={filters.person || 'All'}
          onChange={(e) => update('person', e.target.value)}
          className={selectClass}
        >
          <option value="All">Org focus</option>
          {filterOptions.people?.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      )}

      <select
        aria-label="Client"
        value={filters.client}
        onChange={(e) => update('client', e.target.value)}
        className={selectClass}
      >
        <option value="All">Client</option>
        {filterOptions.clients.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        aria-label="Role"
        value={filters.role}
        onChange={(e) => update('role', e.target.value)}
        className={selectClass}
      >
        <option value="All">Role</option>
        {filterOptions.roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select
        aria-label="Status"
        value={filters.rag}
        onChange={(e) => update('rag', e.target.value)}
        className={selectClass}
      >
        <option value="All">Status</option>
        <option value="GREEN">Ready</option>
        <option value="AMBER">Watch</option>
        <option value="RED">At risk</option>
      </select>

      <select
        aria-label="Allocation"
        value={filters.allocation || 'All'}
        onChange={(e) => update('allocation', e.target.value)}
        className={selectClass}
      >
        <option value="All">Allocation</option>
        <option value="Project">On project</option>
        <option value="Bench">On bench</option>
      </select>

      <p className="type-secondary">
        Showing {filteredEmployees.length} people
      </p>

      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => update(chip.key, 'All')}
          className={`hit inline-flex items-center gap-3 rounded-full border bg-white px-3 font-medium ${CHIP_CLASS[chip.tone] || CHIP_CLASS.role}`}
        >
          {chip.label}
          <X size={11} />
        </button>
      ))}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="hit font-semibold text-tessolve-navy underline decoration-2 underline-offset-4"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
