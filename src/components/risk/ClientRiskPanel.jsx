import { AlertTriangle } from 'lucide-react'
import RagBadge from '../common/RagBadge'

export default function ClientRiskPanel({ clients, spofAlerts }) {
  return (
    <div className="space-y-4">
      {spofAlerts.length > 0 && (
        <div className="rounded border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 shrink-0 text-rag-amber" size={16} />
            <div>
              <h3 className="text-sm text-amber-900">SPOF / client risk</h3>
              <p className="mt-1 text-sm text-amber-800">
                Clients with fewer than 2 people at SMT 93k (8/Both) or Platform ≥ 8:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-amber-900">
                {spofAlerts.map((c) => (
                  <li key={c.client}>
                    <span className="text-slate-800">{c.client}</span>
                    {' — '}
                    {c.highSkillCount} high-skill
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-3 py-3 text-left font-normal">Client</th>
              <th className="px-3 py-3 text-left font-normal">Headcount</th>
              <th className="px-3 py-3 text-left font-normal">High skill</th>
              <th className="px-3 py-3 text-left font-normal">Health</th>
              <th className="px-3 py-3 text-left font-normal">SPOF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map((c) => (
              <tr key={c.client} className="hover:bg-slate-50">
                <td className="px-3 py-2.5 text-slate-800">{c.client}</td>
                <td className="px-3 py-2.5 text-slate-600">{c.total}</td>
                <td className="px-3 py-2.5 font-mono text-slate-600">
                  {c.highSkillCount}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="text-rag-green">G {c.health.greenPct}%</span>
                    <span className="text-rag-amber">A {c.health.amberPct}%</span>
                    <span className="text-rag-red">R {c.health.redPct}%</span>
                    <span className="text-slate-400">D {c.health.departedPct}%</span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  {c.isSpof ? (
                    <RagBadge status="AMBER" small />
                  ) : (
                    <RagBadge status="GREEN" small />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
