import { useApp } from '../../context/AppContext'
import RagBadge from '../common/RagBadge'
import { clientColor } from '../../utils/clientColors'
import EmployeeSidebar from './EmployeeSidebar'

export default function TeamRoster() {
  const {
    filteredEmployees,
    toggleDeparted,
    setSelectedEmployeeId,
    setFilters,
  } = useApp()

  return (
    <div className="page-shell pb-10">
      <div className="mb-3">
        <h2 className="font-display text-xl font-semibold text-tessolve-navy">
          Team Roster
        </h2>
        <p className="text-sm text-slate-500">
          {filteredEmployees.length} people · click a row to view · Edit in
          sidebar to change
        </p>
      </div>

      <div className="card-plush overflow-x-auto p-0">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50/90 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-3 py-2.5 font-normal">Employee</th>
              <th className="px-3 py-2.5 font-normal">Role</th>
              <th className="px-3 py-2.5 font-normal">Client</th>
              <th className="px-3 py-2.5 font-normal">Allocation</th>
              <th className="px-3 py-2.5 font-normal">Billing mo</th>
              <th className="px-3 py-2.5 font-normal">Overall</th>
              <th className="px-3 py-2.5 font-normal">Status</th>
              <th className="px-3 py-2.5 font-normal">Failed</th>
              <th className="px-3 py-2.5 font-normal">Departed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-10 text-center text-slate-500"
                >
                  No employees match the current filters. Clear filters to see
                  everyone.
                </td>
              </tr>
            )}
            {filteredEmployees.map((emp) => (
              <tr
                key={emp.id}
                onClick={() => setSelectedEmployeeId(emp.id)}
                className={`cursor-pointer transition hover:bg-sky-50/70 ${
                  emp.isDeparted ? 'bg-slate-50 opacity-70' : ''
                }`}
              >
                <td className="px-3 py-2">
                  <span className="font-medium text-tessolve-navy">
                    {emp.Employee_Name}
                  </span>
                  <div className="text-xs text-slate-400">
                    → {emp.Reports_To || '—'}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{emp.Role}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium"
                    style={{
                      color: clientColor(emp.Client),
                      backgroundColor: `${clientColor(emp.Client)}18`,
                    }}
                  >
                    <span
                      className="inline-block size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: clientColor(emp.Client) }}
                      aria-hidden
                    />
                    {emp.Client}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">
                  {emp.Allocation_Status === 'Bench' ? 'Bench' : 'Project'}
                </td>
                <td className="px-3 py-2 font-mono text-slate-700">
                  {emp.Billing_Months_Remaining ?? 0}
                </td>
                <td className="px-3 py-2 font-mono text-slate-700">
                  {emp.Overall_Score}
                </td>
                <td
                  className="px-3 py-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <RagBadge
                    status={emp.ragStatus}
                    human
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        rag: f.rag === emp.ragStatus ? 'All' : emp.ragStatus,
                      }))
                    }
                  />
                </td>
                <td className="max-w-[8rem] px-3 py-2">
                  {emp.failedResponsibilities?.length ? (
                    <span className="text-xs text-rag-red">
                      {emp.failedResponsibilities.length}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td
                  className="px-3 py-2"
                  onClick={(e) => e.stopPropagation()}
                >
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
