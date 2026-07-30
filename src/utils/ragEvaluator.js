import { LAB_SKILL_COLUMNS, PROCESS_SKILL_COLUMNS } from './csvSchema'

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

function avg(values) {
  if (!values.length) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function normalizeRole(role) {
  const r = String(role || '').trim()
  if (!r) return r
  const lower = r.toLowerCase()
  if (lower === 'manager/staff' || lower === 'manager / staff') return 'Manager/Staff'
  if (lower.includes('manager')) return 'Manager'
  if (lower.includes('staff')) return 'Staff'
  if (lower === 'intern') return 'Intern'
  if (lower === 'sr lead' || lower === 'senior lead') return 'Sr Lead'
  if (lower === 'lead') return 'Lead'
  if (lower.includes('sr eng 2') || lower.includes('sr engineer 2') || lower.includes('senior engineer 2')) {
    return 'Sr Eng 2'
  }
  if (lower.includes('sr eng 1') || lower.includes('sr engineer 1') || lower.includes('senior engineer 1')) {
    return 'Sr Eng 1'
  }
  if (lower.includes('eng 2') || lower.includes('engineer 2')) return 'Eng 2'
  if (lower.includes('eng 1') || lower.includes('engineer 1')) return 'Eng 1'
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

/**
 * Compute scores, failed responsibilities, and base RAG for one employee.
 * @param {object} employee
 * @returns {object}
 */
export function evaluateEmployee(employee) {
  const Max_V93k = Math.max(
    Number(employee.Smartest_V7) || 0,
    Number(employee.Smartest_V8) || 0,
  )

  const Lab_Score = avg(
    LAB_SKILL_COLUMNS.map((col) => Number(employee[col]) || 0),
  )

  const Process_Score = avg(
    PROCESS_SKILL_COLUMNS.map((col) => Number(employee[col]) || 0),
  )

  const Overall_Score =
    Max_V93k * 0.35 + Lab_Score * 0.35 + Process_Score * 0.30

  const requiredChecks = getRequiredChecks(employee.Role)
  const failedResponsibilities = requiredChecks
    .filter((flag) => !employee[flag])
    .map((flag) => RESPONSIBILITY_LABELS[flag] || flag)

  const failedCount = failedResponsibilities.length
  const checksMet = failedCount === 0
  const baseline = getRoleBaseline(employee.Role)
  const meetsBaseline = baseline === null || Overall_Score >= baseline

  let ragStatus = 'AMBER'

  const isRedByScore =
    baseline !== null && Overall_Score < baseline - 1.0
  const isRedByChecks = failedCount > 2

  if (isRedByScore || isRedByChecks) {
    ragStatus = 'RED'
  } else if (meetsBaseline && Max_V93k >= 5 && checksMet) {
    ragStatus = 'GREEN'
  } else if (
    (meetsBaseline && !checksMet) ||
    (Max_V93k < 5 && Lab_Score >= 8 && checksMet)
  ) {
    ragStatus = 'AMBER'
  } else {
    ragStatus = 'AMBER'
  }

  return {
    ...employee,
    Max_V93k: round2(Max_V93k),
    Lab_Score: round2(Lab_Score),
    Process_Score: round2(Process_Score),
    Overall_Score: round2(Overall_Score),
    baseline,
    failedResponsibilities,
    checksMet,
    baseRagStatus: ragStatus,
    ragStatus,
    normalizedRole: normalizeRole(employee.Role),
  }
}

function round2(n) {
  return Math.round(n * 100) / 100
}

/** Evaluate an array of raw employee records. */
export function evaluateTeam(employees) {
  return employees.map(evaluateEmployee)
}
