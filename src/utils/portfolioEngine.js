/**
 * Portfolio aggregations for the manager Dashboard.
 */

function activePeople(employees) {
  return (employees || []).filter((e) => !e.isDeparted)
}

function isProject(e) {
  return String(e.Allocation_Status || 'Project') === 'Project'
}

function classifyProjectType(projectType) {
  const t = String(projectType || '')
    .trim()
    .toUpperCase()
  if (t === 'BOTH' || t === 'WS+FT' || t === 'FT+WS') return 'Both'
  if (t === 'FT' || t.startsWith('FT ') || t.endsWith(' FT') || /\bFT\b/.test(t)) {
    return 'FT'
  }
  if (t === 'WS' || t.startsWith('WS ') || t.endsWith(' WS') || /\bWS\b/.test(t)) {
    return 'WS'
  }
  return 'FT'
}

/**
 * Booked project people by client: focus (NPI / Sustaining) and type (FT / WS / Both).
 * Bench people are left out so the bars are work that is actually staffed.
 */
export function buildBookedByClient(employees) {
  const byClient = new Map()
  for (const e of activePeople(employees).filter(isProject)) {
    const client = e.Client || 'Unassigned'
    if (!byClient.has(client)) {
      byClient.set(client, {
        name: client,
        NPI: 0,
        Sustaining: 0,
        FT: 0,
        WS: 0,
        Both: 0,
      })
    }
    const row = byClient.get(client)
    const focus = e.Product_Focus
    if (focus === 'NPI' || focus === 'Sustaining') row[focus] += 1
    row[classifyProjectType(e.Project_Type)] += 1
  }
  const chart = [...byClient.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  )
  return { chart }
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
      shortest: r.minMonths,
      fill: r.lowRunway ? '#DC2626' : '#1E3A5F',
      lowRunway: r.lowRunway,
    })),
    lowAlerts: rows.filter((r) => r.lowRunway),
  }
}

/**
 * People who need monitoring, grouped by client.
 * A person is listed for At risk, projections not current, a single-point-of-failure
 * client, or any failed role responsibility. Billing months are shown either way.
 * spofAlerts is the existing client-risk list ({ client } for clients with < 2 strong people).
 */
export function buildAttentionList(employees, spofAlerts = []) {
  const spofClients = new Set((spofAlerts || []).map((c) => c.client))
  const groups = new Map()

  for (const e of activePeople(employees)) {
    const reasons = []
    if (e.ragStatus === 'RED') reasons.push({ id: 'at-risk' })
    if (!e.Project_Projections_Current) reasons.push({ id: 'projections' })
    const client = e.Client || 'Unassigned'
    if (spofClients.has(client)) reasons.push({ id: 'spof' })
    const failedCount = (e.failedResponsibilities || []).length
    if (failedCount > 0) reasons.push({ id: 'failed', count: failedCount })
    if (!reasons.length) continue

    if (!groups.has(client)) {
      groups.set(client, { client, people: [], hasAtRisk: false })
    }
    const group = groups.get(client)
    const atRisk = e.ragStatus === 'RED'
    if (atRisk) group.hasAtRisk = true
    group.people.push({
      id: e.id,
      name: e.Employee_Name,
      client,
      billingMonths: Number(e.Billing_Months_Remaining) || 0,
      reasons,
      atRisk,
    })
  }

  const list = [...groups.values()]
  list.sort((a, b) => {
    if (a.hasAtRisk !== b.hasAtRisk) return a.hasAtRisk ? -1 : 1
    return a.client.localeCompare(b.client)
  })
  for (const group of list) {
    group.people.sort((a, b) => {
      if (a.atRisk !== b.atRisk) return a.atRisk ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }

  return {
    groups: list,
    total: list.reduce((sum, group) => sum + group.people.length, 0),
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
