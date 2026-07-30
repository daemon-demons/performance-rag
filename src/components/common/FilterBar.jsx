import { useApp } from '../../context/AppContext'

export default function FilterBar() {
  const { filters, setFilters, filterOptions } = useApp()

  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const selectClass =
    'min-w-[140px] rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-tessolve-blue focus:outline-none'

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Person
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

      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Client
        <select
          value={filters.client}
          onChange={(e) => update('client', e.target.value)}
          className={selectClass}
        >
          <option value="All">All Clients</option>
          {filterOptions.clients.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-slate-500">
        Role
        <select
          value={filters.role}
          onChange={(e) => update('role', e.target.value)}
          className={selectClass}
        >
          <option value="All">All Roles</option>
          {filterOptions.roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-slate-500">
        RAG Status
        <select
          value={filters.rag}
          onChange={(e) => update('rag', e.target.value)}
          className={selectClass}
        >
          <option value="All">All Statuses</option>
          <option value="GREEN">Green</option>
          <option value="AMBER">Amber</option>
          <option value="RED">Red</option>
        </select>
      </label>
    </div>
  )
}
