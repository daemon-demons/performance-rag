import { describe, expect, it } from 'vitest'
import { applyAttritionCascade } from './attritionCascade'

describe('applyAttritionCascade', () => {
  it('downgrades mentees when mentor departed', () => {
    const team = [
      {
        Employee_Name: 'Mentor',
        Mentor_Name: '',
        isDeparted: true,
        baseRagStatus: 'GREEN',
      },
      {
        Employee_Name: 'Mentee',
        Mentor_Name: 'Mentor',
        isDeparted: false,
        baseRagStatus: 'GREEN',
      },
    ]
    const after = applyAttritionCascade(team, true)
    const mentee = after.find((e) => e.Employee_Name === 'Mentee')
    expect(mentee.ragStatus).toBe('AMBER')
    expect(mentee.attritionDowngraded).toBe(true)
  })

  it('does nothing when attrition mode off', () => {
    const team = [
      {
        Employee_Name: 'Mentor',
        Mentor_Name: '',
        isDeparted: true,
        baseRagStatus: 'GREEN',
      },
      {
        Employee_Name: 'Mentee',
        Mentor_Name: 'Mentor',
        isDeparted: false,
        baseRagStatus: 'GREEN',
      },
    ]
    const after = applyAttritionCascade(team, false)
    expect(after.find((e) => e.Employee_Name === 'Mentee').ragStatus).toBe(
      'GREEN',
    )
  })
})
