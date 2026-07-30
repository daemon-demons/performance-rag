import { useApp } from '../../context/AppContext'
import RagBadge from '../common/RagBadge'

export default function TeamRoster() {
  const { filteredEmployees, toggleDeparted, attritionMode } = useApp()

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Team Roster
          </h2>
          <p className="text-sm text-slate-500">
            {filteredEmployees.length} engineer
            {filteredEmployees.length === 1 ? '' : 's'} shown
            {attritionMode ? ' · attrition cascade active' : ''}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-3 py-3 font-semibold">Employee</th>
              <th className="px-3 py-3 font-semibold">Role</th>
              <th className="px-3 py-3 font-semibold">Client</th>
              <th className="px-3 py-3 font-semibold">Overall</th>
              <th className="px-3 py-3 font-semibold">Max V93k</th>
              <th className="px-3 py-3 font-semibold">Lab</th>
              <th className="px-3 py-3 font-semibold">Process</th>
              <th className="px-3 py-3 font-semibold">RAG</th>
              <th className="px-3 py-3 font-semibold">Failed Responsibilities</th>
              <th className="px-3 py-3 font-semibold">Departed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-10 text-center text-slate-500"
                >
                  No employees match the current filters.
                </td>
              </tr>
            )}
            {filteredEmployees.map((emp) => (
              <tr
                key={emp.id}
                className={`hover:bg-slate-50/80 ${
                  emp.isDeparted ? 'bg-slate-100/80 opacity-70' : ''
                }`}
              >
                <td className="px-3 py-2.5">
                  <div className="font-medium text-slate-900">
                    {emp.Employee_Name}
                  </div>
                  <div className="text-xs text-slate-500">
                    Mentor: {emp.Mentor_Name || '—'}
                    {emp.attritionDowngraded && (
                      <span className="ml-1 text-tessolve-orange">
                        · cascade
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">
                  {emp.Role}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">
                  {emp.Client}
                </td>
                <td className="px-3 py-2.5 font-mono text-slate-800">
                  {emp.Overall_Score}
                </td>
                <td className="px-3 py-2.5 font-mono text-slate-800">
                  {emp.Max_V93k}
                </td>
                <td className="px-3 py-2.5 font-mono text-slate-800">
                  {emp.Lab_Score}
                </td>
                <td className="px-3 py-2.5 font-mono text-slate-800">
                  {emp.Process_Score}
                </td>
                <td className="px-3 py-2.5">
                  <RagBadge status={emp.ragStatus} />
                </td>
                <td className="max-w-xs px-3 py-2.5">
                  {emp.ragStatus === 'GREEN' ||
                  emp.failedResponsibilities.length === 0 ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    <ul className="space-y-0.5 text-xs text-rag-red">
                      {emp.failedResponsibilities.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={emp.isDeparted}
                    aria-label={`Mark ${emp.Employee_Name} departed`}
                    onClick={() => toggleDeparted(emp.id)}
                    className={`relative h-7 w-12 rounded-full transition ${
                      emp.isDeparted ? 'bg-slate-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                        emp.isDeparted ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
