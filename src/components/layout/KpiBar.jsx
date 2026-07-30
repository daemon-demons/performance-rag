import { useApp } from '../../context/AppContext'

function KpiCard({ label, value, accent }) {
  return (
    <div className="flex min-w-[110px] flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
      <span className={`h-2.5 w-2.5 rounded-full ${accent}`} />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-display text-xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

export default function KpiBar() {
  const { kpis } = useApp()

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-stretch gap-3">
        <KpiCard label="Total Team" value={kpis.total} accent="bg-slate-500" />
        <KpiCard label="Green" value={kpis.green} accent="bg-rag-green" />
        <KpiCard label="Amber" value={kpis.amber} accent="bg-rag-amber" />
        <KpiCard label="Red" value={kpis.red} accent="bg-rag-red" />
        <KpiCard label="Departed" value={kpis.departed} accent="bg-slate-400" />
      </div>
    </div>
  )
}
