/**
 * Portfolio aggregations for the manager Dashboard.
 */
import { isHighSkill } from './scoreMaps'

function activePeople(employees) {
  return (employees || []).filter((e) => !e.isDeparted)
}

function isProject(e) {
  return String(e.Allocation_Status || 'Project') === 'Project'
}

function isBench(e) {
  return String(e.Allocation_Status || '') === 'Bench'
}

function classifyProjectType(projectType) {
  const t = String(projectType || '')
    .trim()
    .toUpperCase()
  if (t === 'FT' || t.startsWith('FT ') || t.endsWith(' FT') || /\bFT\b/.test(t)) {
    return 'FT'
  }
  if (t === 'WS' || t.startsWith('WS ') || t.endsWith(' WS') || /\bWS\b/.test(t)) {
    return 'WS'
  }
  return 'Other'
}

/** Project vs Bench headcount among active people. */
export function buildAllocationMix(employees) {
  const active = activePeople(employees)
  let project = 0
  let bench = 0
  for (const e of active) {
    if (isBench(e)) bench += 1
    else project += 1
  }
  return {
    project,
    bench,
    total: active.length,
    chart: [
      { name: 'On project', value: project, key: 'Project' },
      { name: 'On bench', value: bench, key: 'Bench' },
    ],
  }
}

/** NPI / Sustaining / Both among project-allocated people. */
export function buildFocusMix(employees) {
  const projectPeople = activePeople(employees).filter(isProject)
  const counts = { NPI: 0, Sustaining: 0, Both: 0 }
  for (const e of projectPeople) {
    const f = e.Product_Focus
    if (f === 'NPI' || f === 'Sustaining' || f === 'Both') counts[f] += 1
  }
  return {
    ...counts,
    total: projectPeople.length,
    chart: [
      { name: 'NPI', value: counts.NPI },
      { name: 'Sustaining', value: counts.Sustaining },
      { name: 'Both', value: counts.Both },
    ],
  }
}

/** FT / WS / Other among project-allocated people. */
export function buildTypeMix(employees) {
  const projectPeople = activePeople(employees).filter(isProject)
  const counts = { FT: 0, WS: 0, Other: 0 }
  for (const e of projectPeople) {
    counts[classifyProjectType(e.Project_Type)] += 1
  }
  return {
    ...counts,
    total: projectPeople.length,
    chart: [
      { name: 'FT', value: counts.FT },
      { name: 'WS', value: counts.WS },
      { name: 'Other', value: counts.Other },
    ],
  }
}

/** Billing runway by client (avg months among project people). */
export function buildBillingRunway(employees) {
  const byClient = new Map()
  for (const e of activePeople(employees)) {
    if (!isProject(e)) continue
    const client = e.Client || 'Unassigned'
    if (!byClient.has(client)) {
      byClient.set(client, { client, sum: 0, count: 0, min: Infinity })
    }
    const b = byClient.get(client)
    const months = Number(e.Billing_Months_Remaining) || 0
    b.sum += months
    b.count += 1
    b.min = Math.min(b.min, months)
  }

  const rows = [...byClient.values()]
    .map((b) => ({
      client: b.client,
      avgMonths: b.count ? Math.round((b.sum / b.count) * 10) / 10 : 0,
      minMonths: b.min === Infinity ? 0 : b.min,
      people: b.count,
      lowRunway: (b.min === Infinity ? 0 : b.min) < 2,
    }))
    .sort((a, b) => a.minMonths - b.minMonths)

  return {
    rows,
    chart: rows.map((r) => ({
      name: r.client,
      months: r.avgMonths,
      fill: r.lowRunway ? '#DC2626' : r.minMonths < 4 ? '#D97706' : '#16A34A',
    })),
    lowAlerts: rows.filter((r) => r.lowRunway),
  }
}

export function listCommitments(employees) {
  const set = new Set()
  for (const e of activePeople(employees)) {
    const c = String(e.Upcoming_Commitment || '').trim()
    if (c) set.add(c)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

/**
 * Rule-based SWOT for an upcoming commitment name.
 */
export function buildCommitmentSwot(employees, commitment) {
  const name = String(commitment || '').trim()
  const active = activePeople(employees)
  const tagged = name
    ? active.filter(
        (e) => String(e.Upcoming_Commitment || '').trim() === name,
      )
    : []
  const clients = [
    ...new Set(tagged.map((e) => e.Client).filter(Boolean)),
  ]

  const strengths = []
  const gaps = []
  const opportunities = []
  const risks = []

  for (const e of tagged) {
    if (e.ragStatus === 'GREEN' && isHighSkill(e)) {
      strengths.push({
        id: e.id,
        text: `${e.Employee_Name} is Ready with strong platform skills`,
      })
    }
    if (e.ragStatus === 'AMBER' || e.ragStatus === 'RED') {
      const fails = (e.failedResponsibilities || []).slice(0, 2)
      const extra = fails.length ? ` (${fails.join(', ')})` : ''
      gaps.push({
        id: e.id,
        text: `${e.Employee_Name} is ${e.ragStatus === 'RED' ? 'At risk' : 'Watch'}${extra}`,
      })
    }
    const months = Number(e.Billing_Months_Remaining) || 0
    if (isProject(e) && months < 2) {
      risks.push({
        id: e.id,
        text: `${e.Employee_Name} has only ${months} month(s) of billing left`,
      })
    }
  }

  const needSc = tagged.some((e) => e.SC_Experience)
  const needSod = tagged.some((e) => e.SOD_Handling)
  for (const e of active.filter(isBench)) {
    const match =
      (needSc && e.SC_Experience) ||
      (needSod && e.SOD_Handling) ||
      isHighSkill(e) ||
      (e.CONT_Status === 'Bringup')
    if (match) {
      opportunities.push({
        id: e.id,
        text: `${e.Employee_Name} is on bench and can help (${e.Role})`,
      })
    }
  }

  for (const client of clients) {
    const onClient = active.filter((e) => e.Client === client && isProject(e))
    const skilled = onClient.filter(isHighSkill)
    if (skilled.length < 2) {
      risks.push({
        id: `spof-${client}`,
        text: `${client} has a single point of failure — fewer than 2 strong people on project`,
      })
    }
  }

  return {
    commitment: name,
    clients,
    strengths: strengths.slice(0, 6),
    gaps: gaps.slice(0, 6),
    opportunities: opportunities.slice(0, 6),
    risks: risks.slice(0, 6),
  }
}

/** Compact readiness counts with human labels. */
export function buildReadinessSummary(employees) {
  const active = activePeople(employees)
  let ready = 0
  let watch = 0
  let atRisk = 0
  for (const e of active) {
    if (e.ragStatus === 'GREEN') ready += 1
    else if (e.ragStatus === 'AMBER') watch += 1
    else if (e.ragStatus === 'RED') atRisk += 1
  }
  return { ready, watch, atRisk, total: active.length }
}
