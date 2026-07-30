import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import OrgNode from './OrgNode'

function buildOrgTree(employees) {
  const byName = new Map()
  const nodes = employees.map((e) => ({
    ...e,
    children: [],
  }))

  for (const node of nodes) {
    byName.set(String(node.Employee_Name).trim().toLowerCase(), node)
  }

  const roots = []
  for (const node of nodes) {
    const manager = String(node.Reports_To || '').trim().toLowerCase()
    if (manager && byName.has(manager) && manager !== String(node.Employee_Name).trim().toLowerCase()) {
      byName.get(manager).children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortRec = (list) => {
    list.sort((a, b) => a.Employee_Name.localeCompare(b.Employee_Name))
    list.forEach((n) => sortRec(n.children))
  }
  sortRec(roots)
  return roots
}

export default function OrgChart() {
  const { filteredEmployees } = useApp()

  const roots = useMemo(
    () => buildOrgTree(filteredEmployees),
    [filteredEmployees],
  )

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <div className="mb-4">
        <h2 className="font-display text-xl font-bold text-slate-900">
          Org Chart
        </h2>
        <p className="text-sm text-slate-500">
          Hierarchy by Reports_To · node color reflects effective RAG
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6">
        {roots.length === 0 ? (
          <p className="py-8 text-center text-slate-500">
            No employees match the current filters.
          </p>
        ) : (
          <ul className="min-w-[280px] space-y-1">
            {roots.map((root) => (
              <OrgNode key={root.id} node={root} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
