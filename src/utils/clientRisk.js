import { isHighSkill } from './scoreMaps'

/**
 * Aggregate per-client SPOF risk and health ratios.
 * SPOF: client has < 2 active high-skill people (SMT/platform).
 * RAG counts exclude departed employees.
 */
export function aggregateClientRisk(employees) {
  const byClient = new Map()

  for (const emp of employees) {
    const client = emp.Client || 'Unassigned'
    if (!byClient.has(client)) {
      byClient.set(client, {
        client,
        total: 0,
        green: 0,
        amber: 0,
        red: 0,
        departed: 0,
        highSkillCount: 0,
      })
    }

    const bucket = byClient.get(client)
    bucket.total += 1

    if (emp.isDeparted) {
      bucket.departed += 1
      continue
    }

    const status = emp.ragStatus
    if (status === 'GREEN') bucket.green += 1
    else if (status === 'AMBER') bucket.amber += 1
    else if (status === 'RED') bucket.red += 1

    if (isHighSkill(emp)) {
      bucket.highSkillCount += 1
    }
  }

  const clients = [...byClient.values()].map((c) => {
    const activeTotal = Math.max(c.total - c.departed, 0)
    const denom = activeTotal || 1
    return {
      ...c,
      isSpof: c.highSkillCount < 2,
      health: {
        greenPct: Math.round((c.green / denom) * 100),
        amberPct: Math.round((c.amber / denom) * 100),
        redPct: Math.round((c.red / denom) * 100),
        departedPct: Math.round((c.departed / (c.total || 1)) * 100),
      },
      activeTotal,
    }
  })

  clients.sort((a, b) => a.client.localeCompare(b.client))

  return { clients, spofAlerts: clients.filter((c) => c.isSpof) }
}
