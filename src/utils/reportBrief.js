import { RAG_LABELS } from './csvSchema.js'
import { aggregateClientRisk } from './clientRisk.js'
import {
  buildAttentionList,
  buildBillingRunway,
  buildReadinessSummary,
} from './portfolioEngine.js'
import { buildLeadershipScores, buildMentorLoad } from './analyticsEngine.js'

const TITLES = {
  person: 'Person report',
  client: 'Client report',
  team: 'Team report',
  mentor: 'Mentor report',
}

export function reportTitle(level) {
  return TITLES[level] || 'Report'
}

export function describeScope(filters = {}) {
  const parts = []
  if (filters.client && filters.client !== 'All') parts.push(filters.client)
  if (filters.role && filters.role !== 'All') parts.push(filters.role)
  if (filters.rag && filters.rag !== 'All') {
    parts.push(RAG_LABELS[filters.rag] || filters.rag)
  }
  if (filters.allocation && filters.allocation !== 'All') {
    parts.push(filters.allocation === 'Bench' ? 'On bench' : 'On project')
  }
  if (filters.person && filters.person !== 'All') parts.push(filters.person)
  return parts.length ? parts.join(' · ') : 'All people'
}

function reasonLabel(reason) {
  if (reason.id === 'failed') return `Failed ${reason.count}`
  if (reason.id === 'at-risk') return 'At risk'
  if (reason.id === 'projections') return 'Projections not current'
  if (reason.id === 'spof') return 'Single point of failure'
  return reason.id
}

function attentionPeople(people) {
  return (people || []).map((person) => ({
    name: person.name,
    billingMonths: person.billingMonths,
    reasons: (person.reasons || []).map(reasonLabel),
  }))
}

export function buildPersonBrief(employee) {
  if (!employee) return null
  return {
    name: employee.Employee_Name,
    status: employee.isDeparted
      ? 'Departed'
      : RAG_LABELS[employee.ragStatus] || employee.ragStatus,
    overall: employee.Overall_Score,
    platform: employee.Platform_Score,
    delivery: employee.Delivery_Score,
    depth: employee.Depth_Score,
    failed: employee.failedResponsibilities || [],
    client: employee.Client || 'Unassigned',
    billingMonths: Number(employee.Billing_Months_Remaining) || 0,
    mentor: employee.Mentor_Name || '—',
    reportsTo: employee.Reports_To || '—',
  }
}

export function buildClientBriefs(employees, clientFilter = 'All') {
  const list = employees || []
  const risk = aggregateClientRisk(list)
  const billing = buildBillingRunway(list)
  const attention = buildAttentionList(list, risk.spofAlerts)
  const billingByClient = new Map(billing.rows.map((row) => [row.client, row]))
  const attentionByClient = new Map(
    attention.groups.map((group) => [group.client, group.people]),
  )
  const clients =
    clientFilter && clientFilter !== 'All'
      ? risk.clients.filter((client) => client.client === clientFilter)
      : risk.clients

  return clients.map((client) => ({
    client: client.client,
    ready: client.green,
    watch: client.amber,
    atRisk: client.red,
    shortestBilling: billingByClient.has(client.client)
      ? billingByClient.get(client.client).minMonths
      : null,
    spof: client.isSpof,
    attention: attentionPeople(attentionByClient.get(client.client)),
  }))
}

export function buildTeamBrief(employees) {
  const list = employees || []
  const risk = aggregateClientRisk(list)
  const summary = buildReadinessSummary(list)
  const attention = buildAttentionList(list, risk.spofAlerts)
  return {
    ready: summary.ready,
    watch: summary.watch,
    atRisk: summary.atRisk,
    active: summary.total,
    attention: attention.groups.map((group) => ({
      client: group.client,
      people: attentionPeople(group.people),
    })),
    leadership: buildLeadershipScores(list).map((row) => ({
      name: row.name,
      role: row.role,
      reportCount: row.reportCount,
      score: row.score,
    })),
  }
}

export function buildMentorBriefs(employees) {
  return buildMentorLoad(employees || []).map((row) => ({
    mentor: row.mentor,
    ready: row.green,
    watch: row.amber,
    atRisk: row.red,
  }))
}
