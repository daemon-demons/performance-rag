/**
 * Build parent→children tree from employees using Reports_To.
 */
export function buildOrgTree(employees) {
  const nodes = employees.map((e) => ({
    ...e,
    children: [],
  }))

  const byName = new Map()
  for (const node of nodes) {
    byName.set(String(node.Employee_Name).trim().toLowerCase(), node)
  }

  const roots = []
  for (const node of nodes) {
    const manager = String(node.Reports_To || '').trim().toLowerCase()
    if (
      manager &&
      byName.has(manager) &&
      manager !== String(node.Employee_Name).trim().toLowerCase()
    ) {
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

/** Collect employee + all descendants by Reports_To (raw or evaluated list). */
export function collectSubtree(employees, personName) {
  const target = String(personName || '').trim().toLowerCase()
  if (!target) return employees

  const byManager = new Map()
  for (const e of employees) {
    const mgr = String(e.Reports_To || '').trim().toLowerCase()
    if (!mgr) continue
    if (!byManager.has(mgr)) byManager.set(mgr, [])
    byManager.get(mgr).push(e)
  }

  const root = employees.find(
    (e) => String(e.Employee_Name).trim().toLowerCase() === target,
  )
  if (!root) return []

  const result = []
  const visit = (emp) => {
    result.push(emp)
    const key = String(emp.Employee_Name).trim().toLowerCase()
    const kids = byManager.get(key) || []
    kids.forEach(visit)
  }
  visit(root)
  return result
}

/** True if making `employeeId` report to `managerName` would create a cycle. */
export function wouldCreateCycle(employees, employeeId, managerName) {
  const employee = employees.find((e) => e.id === employeeId)
  if (!employee) return true
  const empName = String(employee.Employee_Name).trim().toLowerCase()
  const mgrName = String(managerName || '').trim().toLowerCase()
  if (!mgrName) return false
  if (empName === mgrName) return true

  const byName = new Map()
  for (const e of employees) {
    byName.set(String(e.Employee_Name).trim().toLowerCase(), e)
  }

  // Walk up from proposed manager; if we hit employee, cycle
  let current = mgrName
  const seen = new Set()
  while (current) {
    if (current === empName) return true
    if (seen.has(current)) break
    seen.add(current)
    const node = byName.get(current)
    if (!node) break
    current = String(node.Reports_To || '').trim().toLowerCase()
  }
  return false
}
