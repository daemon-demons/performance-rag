import { useApp } from '../../context/AppContext'

function KpiCard({ label, value, accent, active, onClick, hint }) {
  const className = `flex min-w-[100px] flex-1 items-center gap-3 rounded-xl border px-3 py-2.5 text-left shadow-sm ${
    active
      ? 'border-tessolve-orange bg-orange-50 ring-1 ring-tessolve-orange/40'
      : 'border-slate-200/80 bg-white/90'
  } ${
    onClick
      ? 'transition hover:-translate-y-0.5 hover:border-tessolve-blue/40 hover:shadow-md active:scale-[0.99]'
      : ''
  }`

  const body = (
    <>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ${accent}`} />
      <div>
        <p className="text-[11px] text-slate-500">{label}</p>
        <p className="font-display text-lg font-semibold text-tessolve-navy">
          {value}
        </p>
      </div>
    </>
  )

  if (!onClick) {
    return (
      <div className={className} title={hint}>
        {body}
      </div>
    )
  }

  return (
    <button type="button" onClick={onClick} title={hint} className={className}>
      {body}
    </button>
  )
}

export default function KpiBar() {
  const { kpis, filters, setFilters } = useApp()

  const toggleRag = (rag) => {
    setFilters((f) => ({ ...f, rag: f.rag === rag ? 'All' : rag }))
  }

  return (
    <div className="page-shell py-3">
      <div className="flex flex-wrap items-stretch gap-2">
        <KpiCard
          label="Active"
          value={kpis.active}
          accent="bg-slate-700"
          active={false}
          hint="People still on the team. Click to clear filters."
          onClick={() =>
            setFilters((f) => ({
              ...f,
              rag: 'All',
              allocation: 'All',
              client: 'All',
              role: 'All',
              person: 'All',
            }))
          }
        />
        <KpiCard
          label="Ready"
          value={kpis.green}
          accent="bg-rag-green"
          active={filters.rag === 'GREEN'}
          hint="Filter Ready"
          onClick={() => toggleRag('GREEN')}
        />
        <KpiCard
          label="Watch"
          value={kpis.amber}
          accent="bg-rag-amber"
          active={filters.rag === 'AMBER'}
          hint="Filter Watch"
          onClick={() => toggleRag('AMBER')}
        />
        <KpiCard
          label="At risk"
          value={kpis.red}
          accent="bg-rag-red"
          active={filters.rag === 'RED'}
          hint="Filter At risk"
          onClick={() => toggleRag('RED')}
        />
        <KpiCard
          label="Departed"
          value={kpis.departed}
          accent="bg-slate-400"
          active={false}
          hint="People marked departed. Ready, Watch, and At risk add up to Active."
        />
      </div>
    </div>
  )
}
