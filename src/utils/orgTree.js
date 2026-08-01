/**
 * Build parent→children tree from employees using Reports_To.
 * Cycle-safe: re-entrant nodes become roots instead of infinite nesting.
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
    const self = String(node.Employee_Name).trim().toLowerCase()
    const manager = String(node.Reports_To || '').trim().toLowerCase()
    if (
      manager &&
      byName.has(manager) &&
      manager !== self &&
      !wouldAttachCreateCycle(byName, self, manager)
    ) {
      byName.get(manager).children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortRec = (list, stack = new Set()) => {
    list.sort((a, b) => a.Employee_Name.localeCompare(b.Employee_Name))
    for (const n of list) {
      const key = String(n.Employee_Name).trim().toLowerCase()
      if (stack.has(key)) {
        n.children = []
        continue
      }
      stack.add(key)
      sortRec(n.children, stack)
      stack.delete(key)
    }
  }
  sortRec(roots)
  return roots
}

/** Walk manager chain; true if attaching child under manager closes a cycle. */
function wouldAttachCreateCycle(byName, childKey, managerKey) {
  let current = managerKey
  const seen = new Set()
  while (current) {
    if (current === childKey) return true
    if (seen.has(current)) return true
    seen.add(current)
    const node = byName.get(current)
    if (!node) break
    current = String(node.Reports_To || '').trim().toLowerCase()
  }
  return false
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
  const visited = new Set()
  const visit = (emp) => {
    const key = String(emp.Employee_Name).trim().toLowerCase()
    if (visited.has(key)) return
    visited.add(key)
    result.push(emp)
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

/** Detect reporting cycles among employees (by name). */
export function findReportingCycles(employees) {
  const byName = new Map()
  for (const e of employees) {
    byName.set(String(e.Employee_Name).trim().toLowerCase(), e)
  }
  const cycles = []
  const visited = new Set()
  const stack = new Set()

  const dfs = (key, path) => {
    if (stack.has(key)) {
      const i = path.indexOf(key)
      cycles.push(path.slice(i).concat(key))
      return
    }
    if (visited.has(key)) return
    visited.add(key)
    stack.add(key)
    const node = byName.get(key)
    const mgr = String(node?.Reports_To || '').trim().toLowerCase()
    if (mgr && byName.has(mgr)) dfs(mgr, path.concat(key))
    stack.delete(key)
  }

  for (const key of byName.keys()) dfs(key, [])
  return cycles
}
