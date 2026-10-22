import { ENUM_COLUMNS, BOOLEAN_COLUMNS, allowedProjectTypes } from '../../utils/csvSchema'
import { ROLE_OPTIONS, fieldClass } from './employeeSidebarShared'

function Row({ label, children }) {
  return (
    <label className="flex items-baseline justify-between gap-3 border-b border-hairline py-3">
      <span className="type-secondary w-36 shrink-0">{label}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  )
}

export default function EmployeeSidebarEdit({
  draft: d,
  setField,
  nameOptions,
  filterOptions,
}) {
  const projectTypes = allowedProjectTypes(d.Product_Focus || 'Sustaining')

  return (
    <div>
      <h3 className="type-title border-b border-hairline pb-3">
        Edit details
      </h3>
      <p className="type-secondary py-3">
        Use Reports to here for keyboard-accessible org reassignment (drag on
        the org chart is mouse-only). NPI focus allows WS/FT only; Sustaining
        allows WS/FT/Both.
      </p>

      <Row label="Role">
        <select
          className={fieldClass}
          value={d.Role}
          onChange={(e) => setField('Role', e.target.value)}
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Row>

      <Row label="Reports to">
        <select
          className={fieldClass}
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
      </Row>

      <Row label="Mentor">
        <select
          className={fieldClass}
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
      </Row>

      <Row label="Client">
        <select
          className={fieldClass}
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
      </Row>

      <Row label="Product focus">
        <select
          className={fieldClass}
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
      </Row>

      <Row label="Project type">
        <select
          className={fieldClass}
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
      </Row>

      <Row label="Allocation">
        <select
          className={fieldClass}
          value={d.Allocation_Status || 'Project'}
          onChange={(e) => setField('Allocation_Status', e.target.value)}
        >
          <option value="Project">On project</option>
          <option value="Bench">On bench</option>
        </select>
      </Row>

      <Row label="Billing months">
        <input
          type="number"
          min={0}
          className={fieldClass}
          value={d.Billing_Months_Remaining ?? 0}
          onChange={(e) =>
            setField('Billing_Months_Remaining', Number(e.target.value) || 0)
          }
        />
      </Row>

      <Row label="Upcoming commitment">
        <input
          className={fieldClass}
          value={d.Upcoming_Commitment || ''}
          onChange={(e) => setField('Upcoming_Commitment', e.target.value)}
        />
      </Row>

      {Object.entries(ENUM_COLUMNS)
        .filter(
          ([col]) =>
            col !== 'Allocation_Status' &&
            col !== 'Project_Type' &&
            col !== 'Product_Focus',
        )
        .map(([col, options]) => (
          <Row key={col} label={col.replace(/_/g, ' ')}>
            <select
              className={fieldClass}
              value={d[col]}
              onChange={(e) => setField(col, e.target.value)}
            >
              {options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Row>
        ))}

      <Row label="TML Scripting (0–10)">
        <input
          type="number"
          min={0}
          max={10}
          className={fieldClass}
          value={d.TML_Scripting ?? 0}
          onChange={(e) =>
            setField('TML_Scripting', Number(e.target.value) || 0)
          }
        />
      </Row>

      <Row label="CS/ES HVM (0–10)">
        <input
          type="number"
          min={0}
          max={10}
          className={fieldClass}
          value={d.CS_ES_HVM_Releases ?? 0}
          onChange={(e) =>
            setField('CS_ES_HVM_Releases', Number(e.target.value) || 0)
          }
        />
      </Row>

      <div className="mt-2 border-t border-slate-200">
        {BOOLEAN_COLUMNS.map((col) => (
          <label
            key={col}
            className="flex items-center justify-between gap-2 border-b border-slate-300 py-1.5 text-xs text-slate-600"
          >
            <span>{col.replace(/_/g, ' ')}</span>
            <input
              type="checkbox"
              checked={Boolean(d[col])}
              onChange={(e) => setField(col, e.target.checked)}
            />
          </label>
        ))}
        <label className="flex items-center justify-between gap-2 border-b border-slate-300 py-1.5 text-xs text-slate-600">
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
