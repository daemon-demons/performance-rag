import { RAG_LABELS } from './csvSchema.js'
import { getRoleBaseline } from './ragEvaluator.js'
import { aggregateClientRisk } from './clientRisk.js'
import { isHighSkill, smtStrength } from './scoreMaps.js'
import {
  buildAttentionList,
  buildBillingRunway,
  buildReadinessSummary,
} from './portfolioEngine.js'
import {
  buildCapabilitySpof,
  buildLeadershipScores,
  buildMentorLoad,
} from './analyticsEngine.js'
import { buildHierarchyIssues } from './teamShape.js'

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

function activePeople(employees) {
  return (employees || []).filter((person) => !person.isDeparted)
}

function clientOf(employee) {
  return employee?.Client || 'Unassigned'
}

function personWord(count) {
  return count === 1 ? 'person' : 'people'
}

function reasonLabel(reason) {
  if (reason.id === 'failed') return `Failed ${reason.count}`
  if (reason.id === 'at-risk') return 'At risk'
  if (reason.id === 'projections') return 'Projections not current'
  if (reason.id === 'spof') return 'Single point of failure'
  return reason.id
}

function directReports(employee, roster) {
  const name = String(employee?.Employee_Name || '').trim().toLowerCase()
  if (!name) return []
  return activePeople(roster).filter(
    (person) => String(person.Reports_To || '').trim().toLowerCase() === name,
  )
}

function roleBaseline(employee) {
  if (employee && Object.prototype.hasOwnProperty.call(employee, 'baseline')) {
    return employee.baseline
  }
  return getRoleBaseline(employee?.Role)
}

function scoreGap(employee) {
  const baseline = roleBaseline(employee)
  if (baseline === null || baseline === undefined) return null
  const overall = Number(employee?.Overall_Score)
  if (Number.isNaN(overall)) return null
  if (overall < baseline - 1) return { overall, baseline }
  return null
}

function belowBaseline(employee) {
  const baseline = roleBaseline(employee)
  if (baseline === null || baseline === undefined) return null
  const overall = Number(employee?.Overall_Score)
  if (Number.isNaN(overall) || overall >= baseline) return null
  return { overall, baseline }
}

export function skillCounts(viewEmployees, fullEmployees) {
  const view = aggregateClientRisk(viewEmployees)
  const full = aggregateClientRisk(fullEmployees || viewEmployees)
  const fullByClient = new Map(
    full.clients.map((client) => [client.client, client.highSkillCount]),
  )
  const counts = new Map()
  for (const client of view.clients) {
    counts.set(client.client, {
      viewCount: client.highSkillCount,
      fullCount: fullByClient.get(client.client) ?? client.highSkillCount,
    })
  }
  return counts
}

function spofSentence(client, viewCount, fullCount) {
  const noun = personWord(viewCount)
  if (fullCount >= 2) {
    return `${client} has ${viewCount} high-skill ${noun} in this view. The full roster is not a single point.`
  }
  return `${client} has ${viewCount} high-skill ${noun}. Add a second.`
}

function hierarchySentence(reds) {
  if (reds === 1) return '1 direct report is At risk. Clear those reports.'
  if (reds > 1) return `${reds} direct reports are At risk. Clear those reports.`
  return 'Direct reports moved this color. Clear the At risk reports.'
}

export function buildPersonAction(employee, options = {}) {
  if (!employee || employee.isDeparted) return null
  const roster = options.roster || []
  if (employee.hierarchyAdjusted) {
    const reds = directReports(employee, roster).filter(
      (person) => person.ragStatus === 'RED',
    ).length
    return hierarchySentence(reds)
  }
  if (employee.attritionDowngraded) {
    const mentor = employee.Mentor_Name || 'their mentor'
    return `Status follows ${mentor}'s departure.`
  }
  const gap = scoreGap(employee)
  if (gap) {
    return `Overall ${gap.overall} is more than 1 below the ${employee.Role} baseline of ${gap.baseline}.`
  }
  const failed = employee.failedResponsibilities || []
  if (failed.length) return `Clear ${failed.join(', ')}.`
  if (!employee.Project_Projections_Current) return 'Update projections.'
  const spof = options.spof
  if (spof && spof.viewCount < 2) {
    return spofSentence(clientOf(employee), spof.viewCount, spof.fullCount)
  }
  return null
}

export function exceptionAction(employee, viewEmployees, fullEmployees) {
  if (!employee) return null
  const counts = skillCounts(viewEmployees, fullEmployees)
  return buildPersonAction(employee, {
    roster: fullEmployees || viewEmployees || [],
    spof: counts.get(clientOf(employee)),
  })
}

function buildPersonEvidence(employee, roster) {
  const lines = []
  const baseline = roleBaseline(employee)
  if (baseline === null || baseline === undefined) {
    lines.push(`Overall ${employee.Overall_Score}. This role has no baseline.`)
  } else {
    lines.push(
      `Overall ${employee.Overall_Score} against the ${employee.Role} baseline of ${baseline}.`,
    )
  }
  const failed = employee.failedResponsibilities || []
  lines.push(
    failed.length ? `Failed checks: ${failed.join(', ')}.` : 'No failed checks.',
  )
  lines.push(
    employee.Project_Projections_Current
      ? 'Projections are current.'
      : 'Projections are not current.',
  )
  const months = Number(employee.Billing_Months_Remaining) || 0
  lines.push(`${months} billing ${months === 1 ? 'month' : 'months'}.`)
  if (employee.hierarchyAdjusted) {
    const reds = directReports(employee, roster).filter(
      (person) => person.ragStatus === 'RED',
    ).length
    lines.push(
      reds
        ? `Hierarchy moved the color. ${reds} direct ${reds === 1 ? 'report is' : 'reports are'} At risk.`
        : 'Hierarchy moved the color.',
    )
  }
  if (employee.attritionDowngraded) {
    lines.push(
      `Attrition moved the color after ${employee.Mentor_Name || 'their mentor'} departed.`,
    )
  }
  return lines
}

function needsCoach(employee) {
  if (!employee || employee.isDeparted) return false
  if (employee.ragStatus !== 'AMBER' && employee.ragStatus !== 'RED') return false
  const failed = (employee.failedResponsibilities || []).length > 0
  return failed || Boolean(belowBaseline(employee))
}

function coachSentence(employee, roster, spof) {
  if (!employee || employee.isDeparted) return null
  return (
    buildPersonAction(employee, { roster, spof }) ||
    (() => {
      const gap = belowBaseline(employee)
      if (!gap) return null
      return `Overall ${gap.overall} is below the ${employee.Role} baseline of ${gap.baseline}.`
    })()
  )
}

function knowsSmt8(employee) {
  return Boolean(employee.SMT_8_Known) || smtStrength(employee) >= 8
}

function coverPerson(full, client, predicate) {
  const active = activePeople(full).filter(
    (person) => clientOf(person) !== client && predicate(person),
  )
  return (
    active.find((person) => person.Allocation_Status === 'Bench') || active[0] || null
  )
}

function linkPerson(text, roster) {
  const names = activePeople(roster)
    .concat((roster || []).filter((person) => person.isDeparted))
    .filter((person) => person.Employee_Name)
    .sort((a, b) => b.Employee_Name.length - a.Employee_Name.length)
  const hit = names.find((person) => text.startsWith(person.Employee_Name))
  if (!hit) return { text }
  return {
    text,
    personId: hit.id,
    personName: hit.Employee_Name,
    client: clientOf(hit),
  }
}

export function buildWorklist(viewEmployees, fullEmployees) {
  const view = viewEmployees || []
  const full = fullEmployees || view
  const counts = skillCounts(view, full)
  const caps = buildCapabilitySpof(view)
  const coach = []
  for (const person of activePeople(view)) {
    if (!needsCoach(person)) continue
    const text = coachSentence(person, full, counts.get(clientOf(person)))
    if (!text) continue
    coach.push({
      id: `coach-${person.id || person.Employee_Name}`,
      text: `${person.Employee_Name}: ${text}`,
      personId: person.id,
      personName: person.Employee_Name,
      client: clientOf(person),
    })
  }

  const cover = []
  for (const cap of caps) {
    if (cap.smt8 < 2) {
      const coverBy = coverPerson(full, cap.client, knowsSmt8)
      cover.push({
        id: `cover-smt-${cap.client}`,
        text: `${cap.client} has ${cap.smt8} ${personWord(cap.smt8)} with SMT 8.${
          coverBy ? ` ${coverBy.Employee_Name} can cover.` : ''
        }`,
        personId: coverBy?.id,
        personName: coverBy?.Employee_Name,
        client: cap.client,
      })
    }
    if (cap.contBringup < 2) {
      const coverBy = coverPerson(
        full,
        cap.client,
        (person) => person.CONT_Status === 'Bringup',
      )
      cover.push({
        id: `cover-cont-${cap.client}`,
        text: `${cap.client} has ${cap.contBringup} ${personWord(cap.contBringup)} with CONT Bringup.${
          coverBy ? ` ${coverBy.Employee_Name} can cover.` : ''
        }`,
        personId: coverBy?.id,
        personName: coverBy?.Employee_Name,
        client: cap.client,
      })
    }
    if (cap.ipAdvanced < 1) {
      const coverBy = coverPerson(
        full,
        cap.client,
        (person) => person.IP_Debug_Level === 'Advanced',
      )
      cover.push({
        id: `cover-ip-${cap.client}`,
        text: `${cap.client} has nobody at IP Advanced.${
          coverBy ? ` ${coverBy.Employee_Name} can cover.` : ''
        }`,
        personId: coverBy?.id,
        personName: coverBy?.Employee_Name,
        client: cap.client,
      })
    }
  }

  const risk = aggregateClientRisk(view)
  const riskByClient = new Map(risk.clients.map((client) => [client.client, client]))
  const bench = []
  for (const person of activePeople(full)) {
    if (person.Allocation_Status !== 'Bench') continue
    const targets = []
    for (const cap of caps) {
      if (clientOf(person) === cap.client) continue
      const skills = []
      const bucket = riskByClient.get(cap.client)
      if (isHighSkill(person) && bucket && bucket.highSkillCount < 2) {
        skills.push('high skill')
      }
      if (person.CONT_Status === 'Bringup' && cap.contBringup < 2) {
        skills.push('CONT Bringup')
      }
      if (person.SC_Experience && cap.sc < 1) skills.push('SC')
      if (person.SOD_Handling && cap.sod < 1) skills.push('SOD')
      if (skills.length) targets.push({ client: cap.client, skills })
    }
    if (!targets.length) continue
    const clients = [...new Set(targets.map((target) => target.client))]
    const skills = [...new Set(targets.flatMap((target) => target.skills))]
    bench.push({
      id: `bench-${person.id || person.Employee_Name}`,
      text: `Point ${person.Employee_Name} at ${clients.join(', ')} for ${skills.join(', ')}.`,
      personId: person.id,
      personName: person.Employee_Name,
      client: clients.length === 1 ? clients[0] : undefined,
      clients,
    })
  }

  const shape = buildHierarchyIssues(view).map((text, index) => ({
    id: `shape-${index}`,
    ...linkPerson(text, full),
  }))
  for (const row of buildMentorLoad(view)) {
    const watching = row.amber + row.red
    if (watching < 2) continue
    const mentor = (full || []).find(
      (person) => person.Employee_Name === row.mentor,
    )
    shape.push({
      id: `shape-mentor-${row.mentor}`,
      text: `${row.mentor} has ${watching} mentees on Watch or At risk.`,
      personId: mentor?.id,
      personName: row.mentor,
      client: mentor ? clientOf(mentor) : undefined,
    })
  }

  const booking = []
  for (const person of activePeople(view)) {
    if (person.Allocation_Status === 'Bench') continue
    const months = Number(person.Billing_Months_Remaining) || 0
    if (months >= 2) continue
    const next = String(person.Upcoming_Commitment || '').trim()
    const unit = months === 1 ? 'month' : 'months'
    booking.push({
      id: `book-${person.id || person.Employee_Name}`,
      text: `${person.Employee_Name} has ${months} ${unit} of billing left.${
        next ? ` Next booking: ${next}.` : ''
      }`,
      personId: person.id,
      personName: person.Employee_Name,
      client: clientOf(person),
    })
  }

  return [
    { id: 'coach', label: 'Coach', items: coach },
    { id: 'cover', label: 'Cover', items: cover },
    { id: 'bench', label: 'Use the bench', items: bench },
    { id: 'shape', label: 'Shape', items: shape },
    { id: 'booking', label: 'Booking', items: booking },
  ]
}

export function linesForClient(worklist, client) {
  return (worklist || []).flatMap((group) =>
    group.items.filter(
      (item) => item.client === client || (item.clients || []).includes(client),
    ),
  )
}

function attentionPeople(people, byId, roster, counts) {
  return (people || []).map((person) => {
    const employee = byId.get(person.id)
    const client = person.client || (employee ? clientOf(employee) : 'Unassigned')
    return {
      id: person.id,
      name: person.name,
      billingMonths: person.billingMonths,
      reasons: (person.reasons || []).map(reasonLabel),
      action: employee
        ? buildPersonAction(employee, { roster, spof: counts.get(client) })
        : null,
    }
  })
}

export function buildPersonBrief(employee, viewEmployees, fullEmployees) {
  if (!employee) return null
  const roster = fullEmployees || viewEmployees || [employee]
  const counts = skillCounts(viewEmployees || roster, roster)
  return {
    id: employee.id,
    name: employee.Employee_Name,
    status: employee.isDeparted
      ? 'Departed'
      : RAG_LABELS[employee.ragStatus] || employee.ragStatus,
    overall: employee.Overall_Score,
    platform: employee.Platform_Score,
    delivery: employee.Delivery_Score,
    depth: employee.Depth_Score,
    failed: employee.failedResponsibilities || [],
    client: clientOf(employee),
    billingMonths: Number(employee.Billing_Months_Remaining) || 0,
    mentor: employee.Mentor_Name || '—',
    reportsTo: employee.Reports_To || '—',
    action: coachSentence(employee, roster, counts.get(clientOf(employee))),
    evidence: buildPersonEvidence(employee, roster),
  }
}

export function buildClientBriefs(employees, clientFilter = 'All', fullEmployees) {
  const list = employees || []
  const full = fullEmployees || list
  const risk = aggregateClientRisk(list)
  const fullRisk = aggregateClientRisk(full)
  const fullSkill = new Map(
    fullRisk.clients.map((client) => [client.client, client.highSkillCount]),
  )
  const counts = skillCounts(list, full)
  const billing = buildBillingRunway(list)
  const attention = buildAttentionList(list, risk.spofAlerts)
  const byId = new Map(list.map((person) => [person.id, person]))
  const billingByClient = new Map(billing.rows.map((row) => [row.client, row]))
  const attentionByClient = new Map(
    attention.groups.map((group) => [group.client, group.people]),
  )
  const worklist = buildWorklist(list, full)
  const clients =
    clientFilter && clientFilter !== 'All'
      ? risk.clients.filter((client) => client.client === clientFilter)
      : risk.clients

  return clients.map((client) => {
    const fullCount = fullSkill.get(client.client) ?? client.highSkillCount
    let spofNote = null
    if (client.isSpof && fullCount >= 2) {
      spofNote = spofSentence(client.client, client.highSkillCount, fullCount)
    } else if (client.isSpof) {
      spofNote = `${client.highSkillCount} high-skill ${personWord(client.highSkillCount)}.`
    }
    return {
      client: client.client,
      ready: client.green,
      watch: client.amber,
      atRisk: client.red,
      shortestBilling: billingByClient.has(client.client)
        ? billingByClient.get(client.client).minMonths
        : null,
      spof: client.isSpof,
      highSkillCount: client.highSkillCount,
      spofNote,
      attention: attentionPeople(
        attentionByClient.get(client.client),
        byId,
        full,
        counts,
      ),
      lines: linesForClient(worklist, client.client),
    }
  })
}

export function buildTeamBrief(employees, fullEmployees) {
  const list = employees || []
  const full = fullEmployees || list
  const risk = aggregateClientRisk(list)
  const summary = buildReadinessSummary(list)
  const attention = buildAttentionList(list, risk.spofAlerts)
  const byId = new Map(list.map((person) => [person.id, person]))
  const counts = skillCounts(list, full)
  return {
    ready: summary.ready,
    watch: summary.watch,
    atRisk: summary.atRisk,
    active: summary.total,
    worklist: buildWorklist(list, full),
    attention: attention.groups.map((group) => ({
      client: group.client,
      people: attentionPeople(group.people, byId, full, counts),
    })),
    leadership: buildLeadershipScores(list)
      .filter((row) => row.reportCount > 0)
      .map((row) => ({
        id: row.id,
        name: row.name,
        role: row.role,
        reportCount: row.reportCount,
        score: row.score,
      })),
  }
}

function menteeStatus(person) {
  if (person.isDeparted) return 'Departed'
  return RAG_LABELS[person.ragStatus] || person.ragStatus
}

export function buildMentorBriefs(employees, fullEmployees) {
  const list = employees || []
  const full = fullEmployees || list
  const byName = new Map(
    (full || []).map((person) => [person.Employee_Name, person]),
  )
  return buildMentorLoad(list).map((row) => {
    const mentees = list.filter(
      (person) => String(person.Mentor_Name || '').trim() === row.mentor,
    )
    const moved = mentees.filter((person) => person.attritionDowngraded)
    const mentor = byName.get(row.mentor)
    const watching = row.amber + row.red
    return {
      mentor: row.mentor,
      ready: row.green,
      watch: row.amber,
      atRisk: row.red,
      mentorDeparted: Boolean(mentor?.isDeparted),
      overload:
        watching >= 2
          ? `${row.mentor} has ${watching} mentees on Watch or At risk.`
          : null,
      moved: moved.map((person) => person.Employee_Name),
      mentees: mentees.map((person) => ({
        id: person.id,
        name: person.Employee_Name,
        status: menteeStatus(person),
        moved: Boolean(person.attritionDowngraded),
      })),
    }
  })
}
