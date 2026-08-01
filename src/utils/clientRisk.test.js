import { describe, expect, it } from 'vitest'
import { aggregateClientRisk } from './clientRisk'

describe('aggregateClientRisk', () => {
  it('excludes departed from RAG percentages', () => {
    const { clients } = aggregateClientRisk([
      {
        Client: 'Acme',
        isDeparted: false,
        ragStatus: 'GREEN',
        Max_V93k: 10,
        Platform_Score: 9,
      },
      {
        Client: 'Acme',
        isDeparted: true,
        ragStatus: 'RED',
        Max_V93k: 10,
        Platform_Score: 9,
      },
    ])
    const acme = clients.find((c) => c.client === 'Acme')
    expect(acme.green).toBe(1)
    expect(acme.red).toBe(0)
    expect(acme.departed).toBe(1)
    expect(acme.health.greenPct).toBe(100)
  })
})
