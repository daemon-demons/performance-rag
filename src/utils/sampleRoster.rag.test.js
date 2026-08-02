import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { REQUIRED_COLUMNS } from './csvSchema'
import { validateAndParseCsvText } from './csvValidator'
import { evaluateTeam, applyHierarchyRag } from './ragEvaluator'
import { applyAttritionCascade } from './attritionCascade'

const samplePath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../public/sample/sample_team_roster.csv',
)

describe('sample roster RAG mix', () => {
  it('uses new SMT columns and lands near 60/30/10', () => {
    const text = readFileSync(samplePath, 'utf8')
    const header = text.split('\n')[0]
    expect(header).toContain('SMT_7_Known')
    expect(header).toContain('SMT_8_Known')
    expect(header).not.toContain('SMT_Versions_Known')
    for (const col of REQUIRED_COLUMNS) {
      expect(header).toContain(col)
    }

    const { ok, employees } = validateAndParseCsvText(text)
    expect(ok).toBe(true)
    expect(employees).toHaveLength(17)

    const team = applyHierarchyRag(
      applyAttritionCascade(evaluateTeam(employees), true),
    )
    const active = team.filter((e) => !e.isDeparted)
    const counts = { GREEN: 0, AMBER: 0, RED: 0 }
    for (const e of active) {
      counts[e.ragStatus] = (counts[e.ragStatus] || 0) + 1
    }

    expect(counts.GREEN).toBeGreaterThanOrEqual(9)
    expect(counts.GREEN).toBeLessThanOrEqual(11)
    expect(counts.AMBER).toBeGreaterThanOrEqual(4)
    expect(counts.AMBER).toBeLessThanOrEqual(6)
    expect(counts.RED).toBeGreaterThanOrEqual(1)
    expect(counts.RED).toBeLessThanOrEqual(3)
    expect(counts.GREEN + counts.AMBER + counts.RED).toBe(active.length)
  })
})
