/** Role baseline minimum Overall_Score for GREEN. null = N/A (Manager/Staff). */
export const ROLE_BASELINES = {
  Intern: 4.0,
  'Eng 1': 5.0,
  'Engineer 1': 5.0,
  'Eng 2': 6.0,
  'Engineer 2': 6.0,
  'Sr Eng 1': 7.0,
  'Sr Engineer 1': 7.0,
  'Sr Eng 2': 7.5,
  'Sr Engineer 2': 7.5,
  Lead: 8.0,
  'Sr Lead': 8.5,
  Manager: null,
  'Sr Manager': null,
  Staff: null,
  'Manager/Staff': null,
}

const ROLE_CHECKS = {
  Intern: [],
  'Eng 1': ['Is_Independent'],
  'Engineer 1': ['Is_Independent'],
  'Eng 2': ['Is_Independent', 'Does_Automation_Scripting'],
  'Engineer 2': ['Is_Independent', 'Does_Automation_Scripting'],
  'Sr Eng 1': [
    'Is_Independent',
    'Handles_1_on_1_Mentoring',
    'Produces_Documentation',
  ],
  'Sr Engineer 1': [
    'Is_Independent',
    'Handles_1_on_1_Mentoring',
    'Produces_Documentation',
  ],
  'Sr Eng 2': ['Handles_1_on_1_Mentoring', 'Runs_Classroom_Training'],
  'Sr Engineer 2': ['Handles_1_on_1_Mentoring', 'Runs_Classroom_Training'],
  Lead: ['Manages_Project_Deliverables'],
  'Sr Lead': ['Manages_Project_Deliverables', 'Manages_Multiple_Clients'],
  Manager: [],
  'Sr Manager': [],
  Staff: [],
  'Manager/Staff': [],
}

const RESPONSIBILITY_LABELS = {
  Is_Independent: 'Is Independent',
  Does_Automation_Scripting: 'Does Automation Scripting',
  Handles_1_on_1_Mentoring: 'Handles 1-on-1 Mentoring',
  Produces_Documentation: 'Produces Documentation',
  Runs_Classroom_Training: 'Runs Classroom Training',
  Manages_Project_Deliverables: 'Manages Project Deliverables',
  Manages_Multiple_Clients: 'Manages Multiple Clients',
}

const CONT_MAP = { Bringup: 8, Debug: 5, No_Idea: 1 }
const PRODUCT_MAP = { NPI: 7, Sustaining: 6, Both: 9 }
const IP_MAP = { None: 2, Basic: 5, Advanced: 9 }
const DEMAND_MAP = { Low: 4, Medium: 6, High: 9 }
/** Base 93k SM versions → score for Platform / Max_V93k */
const SMT_MAP = { '7': 7, '8': 8, Both: 10 }

const LEADER_ROLES = new Set([
  'Sr Eng 1',
  'Sr Eng 2',
  'Lead',
  'Sr Lead',
  'Manager',
  'Sr Manager',
  'Staff',
  'Manager/Staff',
])

function avg(values) {
  if (!values.length) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function round2(n) {
  return Math.round(n * 100) / 100
}

function boolScore(v, yes = 8, no = 0) {
  return v ? yes : no
}

export function normalizeRole(role) {
  const r = String(role || '').trim()
  if (!r) return r
  const lower = r.toLowerCase()
  if (lower === 'manager/staff' || lower === 'manager / staff') return 'Manager/Staff'
  if (lower.includes('sr manager') || lower === 'sr manager') return 'Manager'
  if (lower.includes('manager')) return 'Manager'
  if (lower.includes('staff')) return 'Staff'
  if (lower === 'intern') return 'Intern'
  if (lower === 'sr lead' || lower === 'senior lead') return 'Sr Lead'
  if (lower === 'lead') return 'Lead'
  if (
    lower.includes('sr eng 2') ||
    lower.includes('sr engineer 2') ||
    lower.includes('senior engineer 2') ||
    lower === 'sr 2'
  ) {
    return 'Sr Eng 2'
  }
  if (
    lower.includes('sr eng 1') ||
    lower.includes('sr engineer 1') ||
    lower.includes('senior engineer 1') ||
    lower === 'sr 1'
  ) {
    return 'Sr Eng 1'
  }
  if (
    lower.includes('eng 2') ||
    lower.includes('engineer 2') ||
    lower === 'er 2'
  ) {
    return 'Eng 2'
  }
  if (
    lower.includes('eng 1') ||
    lower.includes('engineer 1') ||
    lower === 'er 1'
  ) {
    return 'Eng 1'
  }
  return r
}

export function getRoleBaseline(role) {
  const key = normalizeRole(role)
  if (Object.prototype.hasOwnProperty.call(ROLE_BASELINES, key)) {
    return ROLE_BASELINES[key]
  }
  return 5.0
}

export function getRequiredChecks(role) {
  const key = normalizeRole(role)
  return ROLE_CHECKS[key] || []
}

export function isLeaderRole(role) {
  return LEADER_ROLES.has(normalizeRole(role))
}

/**
 * Compute scores, failed responsibilities, and base RAG for one employee.
 */
export function evaluateEmployee(employee) {
  const smtRaw = String(employee.SMT_Versions_Known ?? '7')
  const smt = SMT_MAP[smtRaw] ?? 7
  const otherTesters = boolScore(employee.Other_Testers)
  const cont = CONT_MAP[employee.CONT_Status] ?? 1
  const dbd = boolScore(employee.DBD_Bringup)
  const scExp = boolScore(employee.SC_Experience)
  const sod = boolScore(employee.SOD_Handling)

  const Platform_Score = avg([smt, otherTesters, cont, dbd, scExp, sod])

  const product = PRODUCT_MAP[employee.Product_Focus] ?? 5
  const demand = DEMAND_MAP[employee.Client_Demand] ?? 5
  const projections = boolScore(employee.Project_Projections_Current)
  const hvm = Number(employee.CS_ES_HVM_Releases) || 0

  const Delivery_Score = avg([product, demand, projections, hvm])

  const ip = IP_MAP[employee.IP_Debug_Level] ?? 2
  const tml = Number(employee.TML_Scripting) || 0
  const Depth_Score = avg([ip, tml])

  const Overall_Score =
    Platform_Score * 0.4 + Delivery_Score * 0.35 + Depth_Score * 0.25

  // Max_V93k = mapped SMT strength (7 / 8 / Both)
  const Max_V93k = smt
  const Lab_Score = avg([cont, dbd])
  const Process_Score = Depth_Score

  const requiredChecks = getRequiredChecks(employee.Role)
  const failedResponsibilities = requiredChecks
    .filter((flag) => !employee[flag])
    .map((flag) => RESPONSIBILITY_LABELS[flag] || flag)

  const failedCount = failedResponsibilities.length
  const checksMet = failedCount === 0
  const baseline = getRoleBaseline(employee.Role)
  const meetsBaseline = baseline === null || Overall_Score >= baseline

  // Knowing any base 93k SM version (7, 8, or Both) satisfies the platform gate
  const smtGateMet = smtRaw === '7' || smtRaw === '8' || smtRaw === 'Both'

  let ragStatus = 'AMBER'

  const isRedByScore = baseline !== null && Overall_Score < baseline - 1.0
  const isRedByChecks = failedCount > 2

  if (isRedByScore || isRedByChecks) {
    ragStatus = 'RED'
  } else if (meetsBaseline && smtGateMet && checksMet) {
    ragStatus = 'GREEN'
  } else if (
    (meetsBaseline && !checksMet) ||
    (!smtGateMet && Lab_Score >= 8 && checksMet)
  ) {
    ragStatus = 'AMBER'
  } else {
    ragStatus = 'AMBER'
  }

  return {
    ...employee,
    SMT_Versions_Known: smtRaw,
    Platform_Score: round2(Platform_Score),
    Delivery_Score: round2(Delivery_Score),
    Depth_Score: round2(Depth_Score),
    Overall_Score: round2(Overall_Score),
    Max_V93k: round2(Max_V93k),
    Lab_Score: round2(Lab_Score),
    Process_Score: round2(Process_Score),
    baseline,
    failedResponsibilities,
    checksMet,
    baseRagStatus: ragStatus,
    ragStatus,
    hierarchyAdjusted: false,
    normalizedRole: normalizeRole(employee.Role),
  }
}

/** Evaluate an array of raw employee records (base RAG only). */
export function evaluateTeam(employees) {
  return employees.map(evaluateEmployee)
}

/**
 * Bottom-up hierarchy RAG: Sr / Lead / Manager impacted by direct reports.
 * Expects employees already after attrition cascade (ragStatus set).
 */
export function applyHierarchyRag(employees) {
  const byName = new Map()
  const result = employees.map((e) => ({
    ...e,
    hierarchyAdjusted: false,
    preHierarchyRag: e.ragStatus,
  }))

  for (const emp of result) {
    byName.set(String(emp.Employee_Name).trim().toLowerCase(), emp)
  }

  const childrenOf = new Map()
  for (const emp of result) {
    const mgr = String(emp.Reports_To || '').trim().toLowerCase()
    if (!mgr) continue
    if (!childrenOf.has(mgr)) childrenOf.set(mgr, [])
    childrenOf.get(mgr).push(emp)
  }

  // Process deepest nodes first via iterative passes (max depth ~10)
  for (let pass = 0; pass < 12; pass += 1) {
    let changed = false
    for (const emp of result) {
      if (!isLeaderRole(emp.Role) || emp.isDeparted) continue
      const key = String(emp.Employee_Name).trim().toLowerCase()
      const reports = (childrenOf.get(key) || []).filter((r) => !r.isDeparted)
      if (!reports.length) continue

      const reds = reports.filter((r) => r.ragStatus === 'RED').length
      const ambers = reports.filter((r) => r.ragStatus === 'AMBER').length
      const total = reports.length
      let next = emp.preHierarchyRag || emp.baseRagStatus

      if (reds >= 2 || reds / total > 0.5) {
        next = 'RED'
      } else if (reds >= 1) {
        next = next === 'GREEN' ? 'AMBER' : next === 'AMBER' ? 'AMBER' : 'RED'
        if (next === 'GREEN') next = 'AMBER'
      } else if (ambers >= 1 && next === 'GREEN') {
        next = 'AMBER'
      }

      // If red present, never stay green
      if (reds >= 1 && next === 'GREEN') next = 'AMBER'

      if (next !== emp.ragStatus) {
        emp.ragStatus = next
        emp.hierarchyAdjusted = next !== emp.preHierarchyRag
        changed = true
      } else if (next !== emp.preHierarchyRag) {
        emp.hierarchyAdjusted = true
      }
    }
    if (!changed) break
  }

  return result
}
