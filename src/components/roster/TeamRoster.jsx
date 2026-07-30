import { useApp } from '../../context/AppContext'
import RagBadge from '../common/RagBadge'
import EmployeeSidebar from './EmployeeSidebar'

export default function TeamRoster() {
  const { filteredEmployees, toggleDeparted, setSelectedEmployeeId } = useApp()

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-slate-900">
          Team Roster
        </h2>
        <p className="text-sm text-slate-500">
          {filteredEmployees.length} people · click a name to view & edit
        </p>
      </div>

      <div className="overflow-x-auto rounded border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-3 py-3 font-normal">Employee</th>
              <th className="px-3 py-3 font-normal">Role</th>
              <th className="px-3 py-3 font-normal">Client</th>
              <th className="px-3 py-3 font-normal">Overall</th>
              <th className="px-3 py-3 font-normal">SMT 93k</th>
              <th className="px-3 py-3 font-normal">Platform</th>
              <th className="px-3 py-3 font-normal">Delivery</th>
              <th className="px-3 py-3 font-normal">Depth</th>
              <th className="px-3 py-3 font-normal">RAG</th>
              <th className="px-3 py-3 font-normal">Failed</th>
              <th className="px-3 py-3 font-normal">Departed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="px-3 py-10 text-center text-slate-500"
                >
                  No employees match the current filters.
                </td>
              </tr>
            )}
            {filteredEmployees.map((emp) => (
              <tr
                key={emp.id}
                className={`hover:bg-slate-50 ${emp.isDeparted ? 'bg-slate-50 opacity-70' : ''}`}
              >
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className="text-left font-medium text-tessolve-blue hover:underline"
                  >
                    {emp.Employee_Name}
                  </button>
                  <div className="text-xs text-slate-400">
                    → {emp.Reports_To || '—'}
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">{emp.Role}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">{emp.Client}</td>
                <td className="px-3 py-2.5 font-mono text-slate-700">
                  {emp.Overall_Score}
                </td>
                <td className="px-3 py-2.5 font-mono text-slate-700">
                  {emp.SMT_Versions_Known}
                </td>
                <td className="px-3 py-2.5 font-mono text-slate-700">
                  {emp.Platform_Score}
                </td>
                <td className="px-3 py-2.5 font-mono text-slate-700">
                  {emp.Delivery_Score}
                </td>
                <td className="px-3 py-2.5 font-mono text-slate-700">
                  {emp.Depth_Score}
                </td>
                <td className="px-3 py-2.5">
                  <RagBadge status={emp.ragStatus} />
                </td>
                <td className="max-w-[10rem] px-3 py-2.5">
                  {emp.failedResponsibilities?.length ? (
                    <span className="text-xs text-rag-red">
                      {emp.failedResponsibilities.length}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={emp.isDeparted}
                    aria-label={`Mark ${emp.Employee_Name} departed`}
                    onClick={() => toggleDeparted(emp.id)}
                    className={`relative h-6 w-11 rounded-full transition ${
                      emp.isDeparted ? 'bg-slate-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition ${
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

      <EmployeeSidebar />
    </div>
  )
}
