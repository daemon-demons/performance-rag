import { isLeaderRole, normalizeRole } from './ragEvaluator.js'
import { findReportingCycles } from './orgTree.js'

const JUNIOR = new Set(['Intern', 'Eng 1', 'Eng 2'])
const SENIOR = new Set([
  'Sr Eng 1',
  'Sr Eng 2',
  'Lead',
  'Sr Lead',
  'Manager',
  'Sr Manager',
  'Staff',
  'Manager/Staff',
])

export function bandOf(role) {
  const key = normalizeRole(role)
  if (JUNIOR.has(key)) return 'junior'
  if (SENIOR.has(key)) return 'senior'
  return null
}

function activePeople(employees) {
  return (employees || []).filter((e) => !e.isDeparted)
}

export function buildTeamBalance(employees) {
  let senior = 0
  let junior = 0
  for (const person of activePeople(employees)) {
    const band = bandOf(person.Role)
    if (band === 'senior') senior += 1
    else if (band === 'junior') junior += 1
  }
  const ratio = junior === 0 ? null : Math.round((senior / junior) * 10) / 10
  return { senior, junior, ratio }
}

export function buildHierarchyIssues(employees) {
  const list = employees || []
  const active = activePeople(list)
  const byName = new Map(
    list.map((person) => [
      String(person.Employee_Name).trim().toLowerCase(),
      person,
    ]),
  )
  const issues = []

  for (const cycle of findReportingCycles(list)) {
    const names = cycle.map((key) => byName.get(key)?.Employee_Name || key)
    issues.push(`Reporting cycle: ${names.join(' → ')}`)
  }

  const childCount = new Map()
  for (const person of active) {
    const managerName = String(person.Reports_To || '').trim()
    if (!managerName) continue
    const key = managerName.toLowerCase()
    const manager = byName.get(key)
    if (!manager) {
      issues.push(
        `${person.Employee_Name} reports to ${managerName}, who is not on the roster`,
      )
      continue
    }
    childCount.set(key, (childCount.get(key) || 0) + 1)
    if (
      !manager.isDeparted &&
      bandOf(person.Role) === 'senior' &&
      bandOf(manager.Role) === 'junior'
    ) {
      issues.push(
        `${person.Employee_Name} reports to junior ${manager.Employee_Name}`,
      )
    }
  }

  for (const person of active) {
    if (!isLeaderRole(person.Role)) continue
    const key = String(person.Employee_Name).trim().toLowerCase()
    if (!childCount.get(key)) {
      issues.push(
        `${person.Employee_Name} is a ${normalizeRole(person.Role)} with no direct reports`,
      )
    }
  }

  for (const person of active) {
    if (!String(person.Mentor_Name || '').trim()) {
      issues.push(`${person.Employee_Name} has no mentor`)
    }
  }

  return issues
}
