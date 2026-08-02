function Fact({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2">
      <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-slate-800">{value || '—'}</p>
    </div>
  )
}

export default function EmployeeSidebarView({ emp, selectEmployeeByName }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Profile
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2">
          <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
            Reports to
          </p>
          {emp.Reports_To ? (
            <button
              type="button"
              className="mt-0.5 text-sm text-tessolve-blue hover:underline"
              onClick={() => selectEmployeeByName(emp.Reports_To)}
            >
              {emp.Reports_To}
            </button>
          ) : (
            <p className="mt-0.5 text-sm text-slate-800">—</p>
          )}
          <p className="mt-1 text-[10px] text-slate-400">
            Keyboard path for org changes: Edit → Reports to
          </p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2">
          <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
            Mentor
          </p>
          {emp.Mentor_Name ? (
            <button
              type="button"
              className="mt-0.5 text-sm text-tessolve-blue hover:underline"
              onClick={() => selectEmployeeByName(emp.Mentor_Name)}
            >
              {emp.Mentor_Name}
            </button>
          ) : (
            <p className="mt-0.5 text-sm text-slate-800">—</p>
          )}
        </div>
        <Fact label="Project type" value={emp.Project_Type} />
        <Fact
          label="Allocation"
          value={
            emp.Allocation_Status === 'Bench' ? 'On bench' : 'On project'
          }
        />
        <Fact
          label="Billing months left"
          value={emp.Billing_Months_Remaining ?? 0}
        />
        <Fact
          label="Upcoming commitment"
          value={emp.Upcoming_Commitment || '—'}
        />
        <Fact
          label="SMT 7"
          value={emp.SMT_7_Known ? 'Known' : 'Unknown'}
        />
        <Fact
          label="SMT 8"
          value={emp.SMT_8_Known ? 'Known' : 'Unknown'}
        />
        <Fact label="CONT" value={emp.CONT_Status} />
        <Fact label="Product" value={emp.Product_Focus} />
        <Fact label="IP debug" value={emp.IP_Debug_Level} />
        <Fact label="Demand" value={emp.Client_Demand} />
        <Fact
          label="SC experience"
          value={emp.SC_Experience ? 'Yes' : 'No'}
        />
        <Fact
          label="SOD handling"
          value={emp.SOD_Handling ? 'Yes' : 'No'}
        />
        <Fact label="TML" value={emp.TML_Scripting} />
        <Fact label="HVM" value={emp.CS_ES_HVM_Releases} />
      </div>
      {emp.failedResponsibilities?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">
            Failed responsibilities
          </p>
          <ul className="mt-1 list-disc pl-4 text-xs text-rag-red">
            {emp.failedResponsibilities.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}
      {emp.isDeparted && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Marked departed — attrition cascade applied
        </p>
      )}
    </div>
  )
}
