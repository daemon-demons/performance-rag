import { describe, it, expect } from 'vitest'
import {
  buildClientBriefs,
  buildMentorBriefs,
  buildPersonBrief,
  buildTeamBrief,
  describeScope,
} from './reportBrief.js'

const people = [
  {
    id: '1',
    Employee_Name: 'Alice',
    Role: 'Lead',
    Client: 'Client Q',
    Allocation_Status: 'Project',
    Billing_Months_Remaining: 5,
    Product_Focus: 'NPI',
    Project_Type: 'WS',
    Platform_Score: 8,
    Overall_Score: 8,
    Delivery_Score: 7,
    Depth_Score: 6,
    ragStatus: 'GREEN',
    failedResponsibilities: [],
    isDeparted: false,
    Mentor_Name: '',
    Reports_To: '',
    Project_Projections_Current: true,
  },
  {
    id: '2',
    Employee_Name: 'Bob',
    Role: 'Eng 1',
    Client: 'Client Q',
    Allocation_Status: 'Project',
    Billing_Months_Remaining: 1,
    Product_Focus: 'Sustaining',
    Project_Type: 'FT',
    Platform_Score: 5,
    Overall_Score: 5,
    Delivery_Score: 5,
    Depth_Score: 4,
    ragStatus: 'AMBER',
    failedResponsibilities: ['Is Independent'],
    isDeparted: false,
    Mentor_Name: 'Alice',
    Reports_To: 'Alice',
    Project_Projections_Current: true,
  },
  {
    id: '3',
    Employee_Name: 'Cara',
    Role: 'Eng 1',
    Client: 'Client A',
    Allocation_Status: 'Bench',
    Billing_Months_Remaining: 0,
    Product_Focus: 'NPI',
    Project_Type: 'FT',
    Platform_Score: 4,
    Overall_Score: 4,
    Delivery_Score: 4,
    Depth_Score: 4,
    ragStatus: 'RED',
    failedResponsibilities: [],
    isDeparted: false,
    Mentor_Name: 'Alice',
    Reports_To: 'Alice',
    Project_Projections_Current: false,
  },
]

describe('reportBrief', () => {
  it('names the active filters', () => {
    expect(describeScope({ client: 'All', role: 'All', rag: 'All' })).toBe(
      'All people',
    )
    expect(
      describeScope({ client: 'Client A', role: 'All', rag: 'RED' }),
    ).toBe('Client A · At risk')
  })

  it('limits the client brief to the filtered client', () => {
    const all = buildClientBriefs(people)
    expect(all.map((row) => row.client)).toEqual(['Client A', 'Client Q'])
    const onlyA = buildClientBriefs(people, 'Client A')
    expect(onlyA).toHaveLength(1)
    expect(onlyA[0].client).toBe('Client A')
    expect(onlyA[0].atRisk).toBe(1)
    const clientQ = all.find((row) => row.client === 'Client Q')
    expect(clientQ.shortestBilling).toBe(1)
    expect(clientQ.ready).toBe(1)
    expect(clientQ.watch).toBe(1)
  })

  it('builds a person brief and a team brief from the same people', () => {
    expect(buildPersonBrief(people[1])).toMatchObject({
      name: 'Bob',
      status: 'Watch',
      client: 'Client Q',
      billingMonths: 1,
      mentor: 'Alice',
      reportsTo: 'Alice',
      failed: ['Is Independent'],
    })
    const team = buildTeamBrief(people)
    expect(team).toMatchObject({ ready: 1, watch: 1, atRisk: 1, active: 3 })
    expect(team.leadership.map((row) => row.name)).toEqual(['Alice'])
    expect(team.attention.map((group) => group.client)).toContain('Client A')
  })

  it('counts mentees by status for mentors in the set', () => {
    const mentors = buildMentorBriefs(people)
    expect(mentors).toEqual([
      { mentor: 'Alice', ready: 0, watch: 1, atRisk: 1 },
    ])
  })
})
