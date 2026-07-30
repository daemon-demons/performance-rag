import { Users, CircleDot, AlertTriangle, UserMinus } from 'lucide-react'
import { useApp } from '../../context/AppContext'

function KpiCard({ label, value, color, icon: Icon }) {
  return (
    <div className="flex min-w-[120px] flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
      >
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
          {label}
        </p>
        <p className="font-display text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

export default function KpiBar() {
  const { kpis, attritionMode, setAttritionMode } = useApp()

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      <div className="flex flex-wrap items-stretch gap-3">
        <KpiCard
          label="Total Team"
          value={kpis.total}
          color="bg-slate-700"
          icon={Users}
        />
        <KpiCard
          label="Green"
          value={kpis.green}
          color="bg-rag-green"
          icon={CircleDot}
        />
        <KpiCard
          label="Amber"
          value={kpis.amber}
          color="bg-rag-amber"
          icon={AlertTriangle}
        />
        <KpiCard
          label="Red"
          value={kpis.red}
          color="bg-rag-red"
          icon={CircleDot}
        />
        <KpiCard
          label="Departed"
          value={kpis.departed}
          color="bg-slate-500"
          icon={UserMinus}
        />

        <div className="flex min-w-[200px] flex-1 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Attrition Simulation
            </p>
            <p className="text-sm text-slate-600">
              {attritionMode ? 'Cascade ON' : 'Cascade OFF'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={attritionMode}
            onClick={() => setAttritionMode((v) => !v)}
            className={`relative h-8 w-14 shrink-0 rounded-full transition ${
              attritionMode ? 'bg-tessolve-orange' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition ${
                attritionMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
