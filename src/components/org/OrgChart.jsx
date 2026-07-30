import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import OrgNode from './OrgNode'
import EmployeeSidebar from '../roster/EmployeeSidebar'
import { buildOrgTree } from '../../utils/orgTree'

export default function OrgChart() {
  const { orgEmployees, filters, reorgPreview, setReorgPreview } = useApp()

  const roots = useMemo(() => {
    const tree = buildOrgTree(orgEmployees)
    // When filtering by person, prefer that person as the sole root if present
    if (filters.person && filters.person !== 'All') {
      const match = tree.find(
        (r) =>
          String(r.Employee_Name).trim().toLowerCase() ===
          String(filters.person).trim().toLowerCase(),
      )
      if (match) return [match]
      // Person is not a root of the subset tree — find them nested
      const find = (nodes) => {
        for (const n of nodes) {
          if (
            String(n.Employee_Name).trim().toLowerCase() ===
            String(filters.person).trim().toLowerCase()
          ) {
            return n
          }
          const hit = find(n.children || [])
          if (hit) return hit
        }
        return null
      }
      const nested = find(tree)
      if (nested) return [nested]
    }
    return tree
  }, [orgEmployees, filters.person])

  return (
    <div className="mx-auto max-w-[100vw] px-4 pb-10 sm:px-6">
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-tessolve-navy">
          Org Chart
        </h2>
        <p className="text-sm text-slate-500">
          {orgEmployees.length} shown · drag a card onto a manager to reassign
        </p>
      </div>

      {reorgPreview && (
        <div className="animate-fade-up mb-4 rounded-xl border border-tessolve-blue/30 bg-sky-50/90 px-4 py-3 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-tessolve-navy">
                Reorg RAG preview · {reorgPreview.title}
              </p>
              <ul className="mt-1 space-y-0.5 text-xs text-slate-700">
                {reorgPreview.deltas.map((d) => (
                  <li key={d.id}>
                    {d.name}:{' '}
                    <span className="font-mono">
                      {d.from} → {d.to}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-800"
              onClick={() => setReorgPreview(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="card-plush overflow-x-auto p-4 sm:p-8">
        {roots.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No employees match the current filters.
          </p>
        ) : (
          <div className="org-chart-root">
            {roots.length === 1 ? (
              <ul className="org-branch m-0 list-none p-0">
                <OrgNode node={roots[0]} />
              </ul>
            ) : (
              <ul className="org-kids org-kids--roots m-0 list-none">
                {roots.map((root) => (
                  <OrgNode key={root.id} node={root} />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <EmployeeSidebar />
    </div>
  )
}
