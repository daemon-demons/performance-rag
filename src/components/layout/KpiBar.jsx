import { useApp } from '../../context/AppContext'

function KpiCard({ label, value, accent, active, onClick, hint }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      className={`flex min-w-[100px] flex-1 items-center gap-3 rounded-xl border px-3 py-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] ${
        active
          ? 'border-tessolve-orange bg-orange-50 ring-1 ring-tessolve-orange/40'
          : 'border-slate-200/80 bg-white/90 hover:border-tessolve-blue/40'
      }`}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ${accent}`} />
      <div>
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className="font-display text-lg font-semibold text-tessolve-navy">
          {value}
        </p>
      </div>
    </button>
  )
}

export default function KpiBar() {
  const { kpis, filters, setFilters } = useApp()

  const toggleRag = (rag) => {
    setFilters((f) => ({ ...f, rag: f.rag === rag ? 'All' : rag }))
  }

  const toggleAllocation = (allocation) => {
    setFilters((f) => ({
      ...f,
      allocation: f.allocation === allocation ? 'All' : allocation,
    }))
  }

  return (
    <div className="page-shell py-3">
      <div className="flex flex-wrap items-stretch gap-2">
        <KpiCard
          label="In view"
          value={kpis.total}
          accent="bg-slate-500"
          active={false}
          hint="People matching current filters"
          onClick={() =>
            setFilters((f) => ({
              ...f,
              rag: 'All',
              allocation: 'All',
              client: 'All',
              role: 'All',
            }))
          }
        />
        <KpiCard
          label="Ready"
          value={kpis.green}
          accent="bg-rag-green"
          active={filters.rag === 'GREEN'}
          hint="Filter Ready (Green)"
          onClick={() => toggleRag('GREEN')}
        />
        <KpiCard
          label="Watch"
          value={kpis.amber}
          accent="bg-rag-amber"
          active={filters.rag === 'AMBER'}
          hint="Filter Watch (Amber)"
          onClick={() => toggleRag('AMBER')}
        />
        <KpiCard
          label="At risk"
          value={kpis.red}
          accent="bg-rag-red"
          active={filters.rag === 'RED'}
          hint="Filter At risk (Red)"
          onClick={() => toggleRag('RED')}
        />
        <KpiCard
          label="On project"
          value={kpis.project}
          accent="bg-tessolve-blue"
          active={filters.allocation === 'Project'}
          hint="Filter people on project"
          onClick={() => toggleAllocation('Project')}
        />
        <KpiCard
          label="On bench"
          value={kpis.bench}
          accent="bg-tessolve-orange"
          active={filters.allocation === 'Bench'}
          hint="Filter people on bench"
          onClick={() => toggleAllocation('Bench')}
        />
      </div>
    </div>
  )
}
