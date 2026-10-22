import { useApp } from '../../context/AppContext'

const SEGMENTS = [
  {
    key: 'GREEN',
    label: 'Ready',
    countKey: 'green',
    className: 'bg-status-ready text-white',
  },
  {
    key: 'AMBER',
    label: 'Watch',
    countKey: 'amber',
    className: 'bg-status-watch text-white',
  },
  {
    key: 'RED',
    label: 'At risk',
    countKey: 'red',
    className: 'bg-status-risk text-white',
  },
]

export default function KpiBar() {
  const { kpis, filters, setFilters } = useApp()

  const toggleRag = (rag) => {
    setFilters((f) => ({ ...f, rag: f.rag === rag ? 'All' : rag }))
  }

  const clearFilters = () => {
    setFilters((f) => ({
      ...f,
      rag: 'All',
      allocation: 'All',
      client: 'All',
      role: 'All',
      person: 'All',
    }))
  }

  const activeTotal = kpis.green + kpis.amber + kpis.red

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={clearFilters}
        title="People still on the team. Click to clear filters."
        className="hit flex items-center gap-3 text-left"
      >
        <span className="font-semibold text-tessolve-navy">{kpis.active}</span>
        <span className="type-secondary">Active</span>
      </button>

      <div className="order-last flex min-w-full overflow-hidden rounded-md border border-hairline md:order-none md:min-w-0 md:flex-1">
        {SEGMENTS.map((seg) => {
          const count = kpis[seg.countKey]
          const grow = activeTotal === 0 ? 1 : Math.max(count, 0.35)
          const selected = filters.rag === seg.key
          return (
            <button
              key={seg.key}
              type="button"
              title={`Filter ${seg.label}`}
              onClick={() => toggleRag(seg.key)}
              style={{ flexGrow: grow, flexBasis: 0 }}
              className={`hit flex min-w-0 items-center justify-center gap-3 px-3 font-semibold ${seg.className} ${
                selected ? 'ring-2 ring-inset ring-white' : ''
              }`}
            >
              <span className="truncate">{seg.label}</span>
              <span className="shrink-0">{count}</span>
            </button>
          )
        })}
      </div>

      <div
        className="hit flex items-center gap-3 text-secondary"
        title="People marked departed. Ready, Watch, and At risk add up to Active."
      >
        <span className="font-semibold">{kpis.departed}</span>
        <span>Departed</span>
      </div>
    </div>
  )
}
