import { normalizeRole, getRoleBaseline, isLeaderRole } from './ragEvaluator'

const CONT_MAP = { Bringup: 8, Debug: 5, No_Idea: 1 }
const IP_MAP = { None: 2, Basic: 5, Advanced: 9 }

export const HEATMAP_COLUMNS = [
  { key: 'smt', label: 'SMT' },
  { key: 'cont', label: 'CONT' },
  { key: 'dbd', label: 'DBD' },
  { key: 'sc', label: 'SC' },
  { key: 'sod', label: 'SOD' },
  { key: 'ip', label: 'IP' },
  { key: 'tml', label: 'TML' },
  { key: 'hvm', label: 'HVM' },
]

function smtStrength(emp) {
  const v = String(emp.SMT_Versions_Known || '')
  if (v === 'Both') return 10
  if (v === '8') return 8
  if (v === '7') return 7
  return emp.Max_V93k ?? 0
}

function cellStrength(emp, key) {
  switch (key) {
    case 'smt':
      return smtStrength(emp)
    case 'cont':
      return CONT_MAP[emp.CONT_Status] ?? 0
    case 'dbd':
      return emp.DBD_Bringup ? 8 : 0
    case 'sc':
      return emp.SC_Experience ? 8 : 0
    case 'sod':
      return emp.SOD_Handling ? 8 : 0
    case 'ip':
      return IP_MAP[emp.IP_Debug_Level] ?? 0
    case 'tml':
      return Number(emp.TML_Scripting) || 0
    case 'hvm':
      return Number(emp.CS_ES_HVM_Releases) || 0
    default:
      return 0
  }
}

/** Skill coverage heatmap rows for active employees. */
export function buildSkillHeatmap(employees) {
  return (employees || [])
    .filter((e) => !e.isDeparted)
    .map((e) => {
      const cells = {}
      for (const col of HEATMAP_COLUMNS) {
        cells[col.key] = cellStrength(e, col.key)
      }
      return {
        id: e.id,
        name: e.Employee_Name,
        role: e.Role,
        client: e.Client,
        rag: e.ragStatus,
        cells,
      }
    })
}

const ROLE_ORDER = [
  'Intern',
  'Eng 1',
  'Eng 2',
  'Sr Eng 1',
  'Sr Eng 2',
  'Lead',
  'Sr Lead',
  'Manager',
  'Staff',
]

/** Role readiness funnel: G/A/R counts + avg baseline gap. */
export function buildRoleFunnel(employees) {
  const byRole = new Map()
  for (const e of employees || []) {
    if (e.isDeparted) continue
    const role = normalizeRole(e.Role) || e.Role || 'Unknown'
    if (!byRole.has(role)) {
      byRole.set(role, {
        role,
        green: 0,
        amber: 0,
        red: 0,
        total: 0,
        gapSum: 0,
      })
    }
    const b = byRole.get(role)
    b.total += 1
    if (e.ragStatus === 'GREEN') b.green += 1
    else if (e.ragStatus === 'AMBER') b.amber += 1
    else if (e.ragStatus === 'RED') b.red += 1
    const baseline = getRoleBaseline(e.Role)
    if (baseline != null) {
      b.gapSum += (Number(e.Overall_Score) || 0) - baseline
    }
  }

  return [...byRole.values()]
    .map((b) => ({
      ...b,
      avgGap: b.total ? Math.round((b.gapSum / b.total) * 100) / 100 : 0,
      greenPct: b.total ? Math.round((b.green / b.total) * 100) : 0,
    }))
    .sort((a, b) => {
      const ia = ROLE_ORDER.indexOf(a.role)
      const ib = ROLE_ORDER.indexOf(b.role)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })
}

/** Mentor load: mentees per mentor + risk mix. */
export function buildMentorLoad(employees) {
  const list = employees || []
  const byMentor = new Map()

  for (const e of list) {
    const mentor = String(e.Mentor_Name || '').trim()
    if (!mentor) continue
    if (!byMentor.has(mentor)) {
      byMentor.set(mentor, {
        mentor,
        mentees: [],
        green: 0,
        amber: 0,
        red: 0,
        departed: 0,
      })
    }
    const b = byMentor.get(mentor)
    b.mentees.push(e.Employee_Name)
    if (e.isDeparted) b.departed += 1
    else if (e.ragStatus === 'GREEN') b.green += 1
    else if (e.ragStatus === 'AMBER') b.amber += 1
    else if (e.ragStatus === 'RED') b.red += 1
  }

  return [...byMentor.values()]
    .map((b) => ({
      ...b,
      menteeCount: b.mentees.length,
      riskScore: b.red * 3 + b.amber * 1 + b.departed * 2,
    }))
    .sort((a, b) => b.riskScore - a.riskScore || b.menteeCount - a.menteeCount)
}

/**
 * Capability SPOF by client: SMT 8/Both, CONT Bringup, IP Advanced.
 */
export function buildCapabilitySpof(employees) {
  const byClient = new Map()
  for (const e of employees || []) {
    if (e.isDeparted) continue
    const client = e.Client || 'Unassigned'
    if (!byClient.has(client)) {
      byClient.set(client, {
        client,
        smt8: 0,
        contBringup: 0,
        ipAdvanced: 0,
        sc: 0,
        sod: 0,
        total: 0,
      })
    }
    const b = byClient.get(client)
    b.total += 1
    const smt = String(e.SMT_Versions_Known || '')
    if (smt === '8' || smt === 'Both') b.smt8 += 1
    if (e.CONT_Status === 'Bringup') b.contBringup += 1
    if (e.IP_Debug_Level === 'Advanced') b.ipAdvanced += 1
    if (e.SC_Experience) b.sc += 1
    if (e.SOD_Handling) b.sod += 1
  }

  return [...byClient.values()]
    .map((b) => ({
      ...b,
      flags: [
        b.smt8 < 2 ? 'SMT 8/Both SPOF' : null,
        b.contBringup < 2 ? 'CONT Bringup SPOF' : null,
        b.ipAdvanced < 1 ? 'No IP Advanced' : null,
      ].filter(Boolean),
    }))
    .sort((a, b) => a.client.localeCompare(b.client))
}

/** Team mean radar axes (0–10). */
export function buildTeamMeanRadar(employees) {
  const active = (employees || []).filter((e) => !e.isDeparted)
  if (!active.length) return []
  const avg = (fn) =>
    Math.round(
      (active.reduce((s, e) => s + fn(e), 0) / active.length) * 100,
    ) / 100

  return HEATMAP_COLUMNS.map((col) => ({
    skill: col.label,
    team: avg((e) => cellStrength(e, col.key)),
  }))
}

export function buildPersonRadar(employee) {
  if (!employee) return []
  return HEATMAP_COLUMNS.map((col) => ({
    skill: col.label,
    person: cellStrength(employee, col.key),
  }))
}

/** Leadership effectiveness for Lead/Manager roles. */
export function buildLeadershipScores(employees) {
  const list = employees || []
  const childrenOf = new Map()
  for (const e of list) {
    const mgr = String(e.Reports_To || '').trim().toLowerCase()
    if (!mgr) continue
    if (!childrenOf.has(mgr)) childrenOf.set(mgr, [])
    childrenOf.get(mgr).push(e)
  }

  return list
    .filter((e) => !e.isDeparted && isLeaderRole(e.Role))
    .map((e) => {
      const key = String(e.Employee_Name).trim().toLowerCase()
      const reports = (childrenOf.get(key) || []).filter((r) => !r.isDeparted)
      const greenShare = reports.length
        ? reports.filter((r) => r.ragStatus === 'GREEN').length / reports.length
        : 0
      const failedRate = reports.length
        ? reports.filter((r) => (r.failedResponsibilities || []).length > 0)
            .length / reports.length
        : 0
      const avgOverall = reports.length
        ? reports.reduce((s, r) => s + (Number(r.Overall_Score) || 0), 0) /
          reports.length
        : 0
      const score =
        Math.round(
          (greenShare * 50 + (1 - failedRate) * 30 + (avgOverall / 10) * 20) *
            100,
        ) / 100
      return {
        id: e.id,
        name: e.Employee_Name,
        role: e.Role,
        reportCount: reports.length,
        greenShare: Math.round(greenShare * 100),
        failedRate: Math.round(failedRate * 100),
        avgOverall: Math.round(avgOverall * 100) / 100,
        score,
      }
    })
    .sort((a, b) => b.score - a.score)
}

/** Auto-generated insight sentences (no AI). */
export function buildAutoInsights(employees, capabilitySpof) {
  const active = (employees || []).filter((e) => !e.isDeparted)
  const insights = []

  for (const c of capabilitySpof || []) {
    if (c.smt8 < 2) {
      insights.push(
        `${c.client} has ${c.smt8} person(s) with SMT 8/Both.`,
      )
    }
    if (c.contBringup < 2) {
      insights.push(
        `${c.client} has thin CONT Bringup coverage (${c.contBringup}).`,
      )
    }
  }

  const eng1 = active.filter((e) => normalizeRole(e.Role) === 'Eng 1')
  if (eng1.length) {
    const fail = eng1.filter((e) => !e.Is_Independent).length
    if (fail) {
      insights.push(`${fail} of ${eng1.length} Eng 1s fail Is_Independent.`)
    }
  }

  const mentors = buildMentorLoad(employees)
  for (const m of mentors.slice(0, 3)) {
    if (m.amber + m.red >= 2) {
      insights.push(
        `${m.mentor} mentors ${m.menteeCount}; ${m.amber + m.red} are Amber/Red.`,
      )
    }
  }

  const ws = active.filter((e) =>
    String(e.Project_Type || '')
      .toUpperCase()
      .includes('WS'),
  )
  const ft = active.filter((e) =>
    String(e.Project_Type || '')
      .toUpperCase()
      .includes('FT'),
  )
  if (ws.length || ft.length) {
    insights.push(
      `Project mix: ${ws.length} on WS, ${ft.length} on FT (distinct types).`,
    )
  }

  const scOnly = active.filter((e) => e.SC_Experience && !e.SOD_Handling).length
  const sodOnly = active.filter((e) => e.SOD_Handling && !e.SC_Experience).length
  if (scOnly || sodOnly) {
    insights.push(
      `SC-only experience: ${scOnly}; SOD-only handling: ${sodOnly}.`,
    )
  }

  return insights.slice(0, 8)
}
