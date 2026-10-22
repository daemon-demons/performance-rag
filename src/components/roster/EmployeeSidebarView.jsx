function Fact({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-slate-300 py-1.5">
      <p className="type-secondary shrink-0">
        {label}
      </p>
      <div className="min-w-0 text-right break-words text-ink">{children}</div>
    </div>
  )
}

export default function EmployeeSidebarView({ emp, selectEmployeeByName }) {
  return (
    <div>
      <h3 className="type-title border-b border-hairline pb-3">
        Profile
      </h3>
      <Fact label="Reports to">
        {emp.Reports_To ? (
          <button
            type="button"
            className="text-tessolve-blue hover:underline"
            onClick={() => selectEmployeeByName(emp.Reports_To)}
          >
            {emp.Reports_To}
          </button>
        ) : (
          '—'
        )}
        <p className="type-secondary">
          Keyboard path for org changes: Edit → Reports to
        </p>
      </Fact>
      <Fact label="Mentor">
        {emp.Mentor_Name ? (
          <button
            type="button"
            className="text-tessolve-blue hover:underline"
            onClick={() => selectEmployeeByName(emp.Mentor_Name)}
          >
            {emp.Mentor_Name}
          </button>
        ) : (
          '—'
        )}
      </Fact>
      <Fact label="Project type">{emp.Project_Type || '—'}</Fact>
      <Fact label="Allocation">
        {emp.Allocation_Status === 'Bench' ? 'On bench' : 'On project'}
      </Fact>
      <Fact label="Billing months left">{emp.Billing_Months_Remaining ?? 0}</Fact>
      <Fact label="Upcoming commitment">{emp.Upcoming_Commitment || '—'}</Fact>
      <Fact label="SMT 7">{emp.SMT_7_Known ? 'Known' : 'Unknown'}</Fact>
      <Fact label="SMT 8">{emp.SMT_8_Known ? 'Known' : 'Unknown'}</Fact>
      <Fact label="CONT">{emp.CONT_Status || '—'}</Fact>
      <Fact label="Product">{emp.Product_Focus || '—'}</Fact>
      <Fact label="IP debug">{emp.IP_Debug_Level || '—'}</Fact>
      <Fact label="Demand">{emp.Client_Demand || '—'}</Fact>
      <Fact label="SC experience">{emp.SC_Experience ? 'Yes' : 'No'}</Fact>
      <Fact label="SOD handling">{emp.SOD_Handling ? 'Yes' : 'No'}</Fact>
      <Fact label="TML">{emp.TML_Scripting ?? '—'}</Fact>
      <Fact label="HVM">{emp.CS_ES_HVM_Releases ?? '—'}</Fact>
      {emp.failedResponsibilities?.length > 0 && (
        <div className="border-b border-slate-100 py-2">
          <p className="type-secondary">
            Failed responsibilities
          </p>
          <ul className="mt-3 list-disc pl-4 text-status-risk">
            {emp.failedResponsibilities.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}
      {emp.isDeparted && (
        <p className="py-2 text-xs text-amber-800">
          Marked departed — attrition cascade applied
        </p>
      )}
    </div>
  )
}
