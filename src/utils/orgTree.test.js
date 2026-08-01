import { describe, expect, it } from 'vitest'
import {
  buildOrgTree,
  collectSubtree,
  wouldCreateCycle,
  findReportingCycles,
} from './orgTree'

const people = [
  { id: 'a', Employee_Name: 'Ada', Reports_To: '' },
  { id: 'b', Employee_Name: 'Ben', Reports_To: 'Ada' },
  { id: 'c', Employee_Name: 'Cara', Reports_To: 'Ben' },
]

describe('buildOrgTree', () => {
  it('nests children under managers', () => {
    const tree = buildOrgTree(people)
    expect(tree).toHaveLength(1)
    expect(tree[0].Employee_Name).toBe('Ada')
    expect(tree[0].children[0].Employee_Name).toBe('Ben')
    expect(tree[0].children[0].children[0].Employee_Name).toBe('Cara')
  })

  it('does not hang on cyclic Reports_To', () => {
    const cyclic = [
      { id: '1', Employee_Name: 'A', Reports_To: 'B' },
      { id: '2', Employee_Name: 'B', Reports_To: 'A' },
    ]
    const started = Date.now()
    const tree = buildOrgTree(cyclic)
    expect(Date.now() - started).toBeLessThan(500)
    expect(tree.length).toBeGreaterThan(0)
  })
})

describe('collectSubtree', () => {
  it('returns person and descendants', () => {
    const sub = collectSubtree(people, 'Ben')
    expect(sub.map((e) => e.Employee_Name).sort()).toEqual(['Ben', 'Cara'])
  })

  it('stops on cycles', () => {
    const cyclic = [
      { id: '1', Employee_Name: 'A', Reports_To: 'B' },
      { id: '2', Employee_Name: 'B', Reports_To: 'A' },
    ]
    const started = Date.now()
    const sub = collectSubtree(cyclic, 'A')
    expect(Date.now() - started).toBeLessThan(500)
    expect(sub.length).toBeLessThanOrEqual(2)
  })
})

describe('wouldCreateCycle / findReportingCycles', () => {
  it('detects proposed cycle', () => {
    expect(wouldCreateCycle(people, 'a', 'Cara')).toBe(true)
    expect(wouldCreateCycle(people, 'c', 'Ada')).toBe(false)
  })

  it('finds existing cycles', () => {
    const cyclic = [
      { id: '1', Employee_Name: 'A', Reports_To: 'B' },
      { id: '2', Employee_Name: 'B', Reports_To: 'A' },
    ]
    expect(findReportingCycles(cyclic).length).toBeGreaterThan(0)
  })
})
