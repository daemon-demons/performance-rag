import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import OrgNode from './OrgNode'
import EmployeeSidebar from '../roster/EmployeeSidebar'
import { buildOrgTree } from '../../utils/orgTree'

export default function OrgChart() {
  const { orgEmployees, filters, reorgPreview, setReorgPreview } = useApp()

  const roots = useMemo(() => {
    const tree = buildOrgTree(orgEmployees)
    if (filters.person && filters.person !== 'All') {
      const match = tree.find(
        (r) =>
          String(r.Employee_Name).trim().toLowerCase() ===
          String(filters.person).trim().toLowerCase(),
      )
      if (match) return [match]
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
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <p className="type-title px-6">Reporting lines · {orgEmployees.length}</p>

      {reorgPreview && (
        <p className="mx-6 mt-3 flex items-baseline justify-between gap-6 border-b border-hairline pb-3 type-secondary">
          <span>
            <span className="font-semibold text-tessolve-navy">
              Reorg RAG preview · {reorgPreview.title}
            </span>{' '}
            {reorgPreview.deltas
              .map((d) => `${d.name}: ${d.from} → ${d.to}`)
              .join(' · ')}
          </span>
          <button
            type="button"
            className="hit shrink-0 text-ink"
            onClick={() => setReorgPreview(null)}
          >
            Dismiss
          </button>
        </p>
      )}

      <div className="mt-6 min-h-0 flex-1 overflow-auto px-6 pb-6">
        {roots.length === 0 ? (
          <p className="py-6 text-center type-secondary">
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
