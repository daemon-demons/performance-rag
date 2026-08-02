import { ENUM_COLUMNS, BOOLEAN_COLUMNS, allowedProjectTypes } from '../../utils/csvSchema'
import { ROLE_OPTIONS, fieldClass } from './employeeSidebarShared'

export default function EmployeeSidebarEdit({
  draft: d,
  setField,
  nameOptions,
  filterOptions,
}) {
  const projectTypes = allowedProjectTypes(d.Product_Focus || 'Sustaining')

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Edit details
      </h3>
      <p className="text-[11px] text-slate-500">
        Use Reports to here for keyboard-accessible org reassignment (drag on
        the org chart is mouse-only). NPI focus allows WS/FT only; Sustaining
        allows WS/FT/Both.
      </p>

      <label className="block text-xs text-slate-500">
        Role
        <select
          className={`mt-1 ${fieldClass}`}
          value={d.Role}
          onChange={(e) => setField('Role', e.target.value)}
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs text-slate-500">
        Reports to
        <select
          className={`mt-1 ${fieldClass}`}
          value={d.Reports_To || ''}
          onChange={(e) => setField('Reports_To', e.target.value)}
        >
          <option value="">— None —</option>
          {nameOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs text-slate-500">
        Mentor
        <select
          className={`mt-1 ${fieldClass}`}
          value={d.Mentor_Name || ''}
          onChange={(e) => setField('Mentor_Name', e.target.value)}
        >
          <option value="">— None —</option>
          {nameOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs text-slate-500">
        Client
        <select
          className={`mt-1 ${fieldClass}`}
          value={d.Client}
          onChange={(e) => setField('Client', e.target.value)}
        >
          {[
            ...new Set([
              d.Client,
              'Client Q',
              'Client A',
              'Client G',
              ...(filterOptions.clients || []),
            ]),
          ]
            .filter(Boolean)
            .map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </select>
      </label>

      <label className="block text-xs text-slate-500">
        Product focus
        <select
          className={`mt-1 ${fieldClass}`}
          value={d.Product_Focus || 'Sustaining'}
          onChange={(e) => {
            const focus = e.target.value
            setField('Product_Focus', focus)
            const allowed = allowedProjectTypes(focus)
            if (!allowed.includes(d.Project_Type)) {
              setField('Project_Type', allowed[0])
            }
          }}
        >
          {ENUM_COLUMNS.Product_Focus.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs text-slate-500">
        Project type (WS / FT / Both)
        <select
          className={`mt-1 ${fieldClass}`}
          value={
            projectTypes.includes(d.Project_Type)
              ? d.Project_Type
              : projectTypes[0]
          }
          onChange={(e) => setField('Project_Type', e.target.value)}
        >
          {projectTypes.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs text-slate-500">
        Allocation
        <select
          className={`mt-1 ${fieldClass}`}
          value={d.Allocation_Status || 'Project'}
          onChange={(e) => setField('Allocation_Status', e.target.value)}
        >
          <option value="Project">On project</option>
          <option value="Bench">On bench</option>
        </select>
      </label>

      <label className="block text-xs text-slate-500">
        Billing months remaining
        <input
          type="number"
          min={0}
          className={`mt-1 ${fieldClass}`}
          value={d.Billing_Months_Remaining ?? 0}
          onChange={(e) =>
            setField('Billing_Months_Remaining', Number(e.target.value) || 0)
          }
        />
      </label>

      <label className="block text-xs text-slate-500">
        Upcoming commitment
        <input
          className={`mt-1 ${fieldClass}`}
          value={d.Upcoming_Commitment || ''}
          onChange={(e) => setField('Upcoming_Commitment', e.target.value)}
        />
      </label>

      {Object.entries(ENUM_COLUMNS)
        .filter(
          ([col]) =>
            col !== 'Allocation_Status' &&
            col !== 'Project_Type' &&
            col !== 'Product_Focus',
        )
        .map(([col, options]) => (
          <label key={col} className="block text-xs text-slate-500">
            {col.replace(/_/g, ' ')}
            <select
              className={`mt-1 ${fieldClass}`}
              value={d[col]}
              onChange={(e) => setField(col, e.target.value)}
            >
              {options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        ))}

      <label className="block text-xs text-slate-500">
        TML Scripting (0–10)
        <input
          type="number"
          min={0}
          max={10}
          className={`mt-1 ${fieldClass}`}
          value={d.TML_Scripting ?? 0}
          onChange={(e) =>
            setField('TML_Scripting', Number(e.target.value) || 0)
          }
        />
      </label>

      <label className="block text-xs text-slate-500">
        CS/ES HVM Releases (0–10)
        <input
          type="number"
          min={0}
          max={10}
          className={`mt-1 ${fieldClass}`}
          value={d.CS_ES_HVM_Releases ?? 0}
          onChange={(e) =>
            setField('CS_ES_HVM_Releases', Number(e.target.value) || 0)
          }
        />
      </label>

      <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
        {BOOLEAN_COLUMNS.map((col) => (
          <label
            key={col}
            className="flex items-center justify-between gap-2 text-xs text-slate-600"
          >
            <span>{col.replace(/_/g, ' ')}</span>
            <input
              type="checkbox"
              checked={Boolean(d[col])}
              onChange={(e) => setField(col, e.target.checked)}
            />
          </label>
        ))}
        <label className="flex items-center justify-between gap-2 text-xs text-slate-600">
          <span>Departed</span>
          <input
            type="checkbox"
            checked={Boolean(d.isDeparted)}
            onChange={(e) => setField('isDeparted', e.target.checked)}
          />
        </label>
      </div>
    </div>
  )
}
