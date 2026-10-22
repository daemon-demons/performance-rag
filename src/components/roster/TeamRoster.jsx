import { useApp } from '../../context/AppContext'
import RagBadge from '../common/RagBadge'
import EmployeeSidebar from './EmployeeSidebar'

const RAIL = {
  GREEN: 'bg-rag-green',
  AMBER: 'bg-rag-amber',
  RED: 'bg-rag-red',
}

export default function TeamRoster() {
  const {
    filteredEmployees,
    toggleDeparted,
    setSelectedEmployeeId,
    setFilters,
  } = useApp()

  return (
    <div className="page-shell pb-6">
      <section className="panel p-6">
      <h2 className="type-title">Headcount · {filteredEmployees.length}</h2>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse text-left">
          <thead className="type-secondary">
            <tr>
              <th className="sticky left-0 z-10 border border-hairline bg-white px-3 py-3 font-medium">Employee</th>
              <th className="border border-hairline px-3 py-3 font-medium">Role</th>
              <th className="border border-hairline px-3 py-3 font-medium">Client</th>
              <th className="border border-hairline px-3 py-3 font-medium">Allocation</th>
              <th className="border border-hairline px-3 py-3 font-medium">Billing mo</th>
              <th className="border border-hairline px-3 py-3 font-medium">Overall</th>
              <th className="border border-hairline px-3 py-3 font-medium">Status</th>
              <th className="border border-hairline px-3 py-3 font-medium">Failed</th>
              <th className="border border-hairline px-3 py-3 font-medium">Departed</th>
            </tr>
          </thead>
          <tbody>
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
            {filteredEmployees.map((emp, index) => {
              const stripe = index % 2 === 1
              const cellBg = stripe ? 'row-stripe' : 'bg-white'
              return (
              <tr
                key={emp.id}
                onClick={() => setSelectedEmployeeId(emp.id)}
                className={`cursor-pointer ${cellBg} ${
                  emp.isDeparted ? 'opacity-70' : ''
                }`}
              >
                <td className={`sticky left-0 z-10 border border-hairline px-3 py-3 ${cellBg}`}>
                  <span
                    className={`absolute inset-y-0 left-0 w-[3px] ${
                      emp.isDeparted ? 'bg-slate-400' : RAIL[emp.ragStatus] || 'bg-slate-300'
                    }`}
                    aria-hidden
                  />
                  <span className="font-medium break-words text-tessolve-navy">
                    {emp.Employee_Name}
                  </span>
                  <div className="type-secondary break-words">
                    Reports to {emp.Reports_To || '—'}
                  </div>
                </td>
                <td className="border border-hairline px-3 py-3 break-words">{emp.Role}</td>
                <td className="border border-hairline px-3 py-3 break-words">
                  {emp.Client}
                </td>
                <td className="border border-hairline px-3 py-3 break-words">
                  {emp.Allocation_Status === 'Bench' ? 'Bench' : 'Project'}
                </td>
                <td className="border border-hairline px-3 py-3">
                  {emp.Billing_Months_Remaining ?? 0}
                </td>
                <td className="border border-hairline px-3 py-3">
                  {emp.Overall_Score}
                </td>
                <td
                  className="border border-hairline px-3 py-3"
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
                <td className="border border-hairline px-3 py-3">
                  {emp.failedResponsibilities?.length ? (
                    <span className="text-status-risk">
                      {emp.failedResponsibilities.length}
                    </span>
                  ) : (
                    <span className="text-secondary">—</span>
                  )}
                </td>
                <td
                  className="border border-hairline px-3 py-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={emp.isDeparted}
                    aria-label={`Mark ${emp.Employee_Name} departed`}
                    onClick={() => toggleDeparted(emp.id)}
                    className={`hit relative w-12 rounded-full max-md:w-14 ${
                      emp.isDeparted ? 'bg-slate-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white max-md:h-10 max-md:w-10 ${
                        emp.isDeparted ? 'translate-x-5 max-md:translate-x-3' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      </section>

      <EmployeeSidebar />
    </div>
  )
}
