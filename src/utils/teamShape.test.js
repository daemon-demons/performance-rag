import { describe, it, expect } from 'vitest'
import { bandOf, buildHierarchyIssues, buildTeamBalance } from './teamShape.js'

const people = [
  {
    id: '1',
    Employee_Name: 'Ada',
    Role: 'Eng 1',
    Reports_To: 'Bea',
    Mentor_Name: 'Bea',
    isDeparted: false,
  },
  {
    id: '2',
    Employee_Name: 'Bea',
    Role: 'Lead',
    Reports_To: '',
    Mentor_Name: 'Ada',
    isDeparted: false,
  },
  {
    id: '3',
    Employee_Name: 'Cara',
    Role: 'Sr Eng 1',
    Reports_To: 'Ada',
    Mentor_Name: '',
    isDeparted: false,
  },
  {
    id: '4',
    Employee_Name: 'Dan',
    Role: 'Manager',
    Reports_To: 'Nobody',
    Mentor_Name: 'Bea',
    isDeparted: false,
  },
]

describe('teamShape', () => {
  it('splits junior and senior roles', () => {
    expect(bandOf('Eng 2')).toBe('junior')
    expect(bandOf('Intern')).toBe('junior')
    expect(bandOf('Sr Eng 1')).toBe('senior')
    expect(bandOf('Manager')).toBe('senior')
    expect(buildTeamBalance(people)).toEqual({
      senior: 3,
      junior: 1,
      ratio: 3,
    })
  })

  it('lists hierarchy issues and skips a departed person', () => {
    const issues = buildHierarchyIssues(people)
    expect(issues).toContain('Cara reports to junior Ada')
    expect(issues).toContain(
      'Dan reports to Nobody, who is not on the roster',
    )
    expect(issues).toContain('Cara has no mentor')
    expect(issues.some((line) => line.includes('Bea') && line.includes('no direct'))).toBe(
      false,
    )
  })

  it('names a reporting cycle', () => {
    const loop = [
      {
        Employee_Name: 'Ann',
        Role: 'Lead',
        Reports_To: 'Bo',
        Mentor_Name: 'Bo',
        isDeparted: false,
      },
      {
        Employee_Name: 'Bo',
        Role: 'Lead',
        Reports_To: 'Ann',
        Mentor_Name: 'Ann',
        isDeparted: false,
      },
    ]
    const issues = buildHierarchyIssues(loop)
    expect(issues.some((line) => line.startsWith('Reporting cycle:'))).toBe(true)
  })
})