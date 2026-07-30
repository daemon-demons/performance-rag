/**
 * Aggregate per-client SPOF risk and health ratios.
 * SPOF: client has < 2 people with SMT Both/8 (Max_V93k >= 8) OR Platform_Score >= 8.
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
    }

    const status = emp.ragStatus
    if (status === 'GREEN') bucket.green += 1
    else if (status === 'AMBER') bucket.amber += 1
    else if (status === 'RED') bucket.red += 1

    const active = !emp.isDeparted
    const smt = emp.Max_V93k ?? 0
    const platform = emp.Platform_Score ?? 0
    if (active && (smt >= 8 || platform >= 8)) {
      bucket.highSkillCount += 1
    }
  }

  const clients = [...byClient.values()].map((c) => {
    const denom = c.total || 1
    return {
      ...c,
      isSpof: c.highSkillCount < 2,
      health: {
        greenPct: Math.round((c.green / denom) * 100),
        amberPct: Math.round((c.amber / denom) * 100),
        redPct: Math.round((c.red / denom) * 100),
        departedPct: Math.round((c.departed / denom) * 100),
      },
      activeTotal: Math.max(c.total - c.departed, 0),
    }
  })

  clients.sort((a, b) => a.client.localeCompare(b.client))

  return { clients, spofAlerts: clients.filter((c) => c.isSpof) }
}
