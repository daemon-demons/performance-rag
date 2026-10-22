import { describe, it, expect } from 'vitest'
import {
  buildClientBriefs,
  buildMentorBriefs,
  buildPersonAction,
  buildPersonBrief,
  buildTeamBrief,
  buildWorklist,
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
    expect(mentors[0]).toMatchObject({
      mentor: 'Alice',
      ready: 0,
      watch: 1,
      atRisk: 1,
      mentorDeparted: false,
      moved: [],
    })
    expect(mentors[0].mentees.map((row) => row.name)).toEqual(['Bob', 'Cara'])
    expect(mentors[0].overload).toBe(
      'Alice has 2 mentees on Watch or At risk.',
    )
  })

  it('lets a failed check beat a stale projection', () => {
    const person = {
      Employee_Name: 'Nia',
      Role: 'Eng 2',
      Overall_Score: 6,
      ragStatus: 'AMBER',
      failedResponsibilities: ['Is Independent'],
      Project_Projections_Current: false,
      isDeparted: false,
      Client: 'Client A',
    }
    expect(buildPersonAction(person, { roster: [person] })).toBe(
      'Clear Is Independent.',
    )
  })

  it('names a hierarchy move ahead of a failed check', () => {
    const report = {
      Employee_Name: 'Jo',
      ragStatus: 'RED',
      isDeparted: false,
      Reports_To: 'Sam',
    }
    const lead = {
      Employee_Name: 'Sam',
      Role: 'Lead',
      hierarchyAdjusted: true,
      ragStatus: 'AMBER',
      failedResponsibilities: ['Manages Project Deliverables'],
      Project_Projections_Current: true,
      Overall_Score: 8,
      isDeparted: false,
    }
    expect(buildPersonAction(lead, { roster: [lead, report] })).toBe(
      '1 direct report is At risk. Clear those reports.',
    )
  })

  it('names an attrition move ahead of a failed check', () => {
    const person = {
      Employee_Name: 'Nia',
      Role: 'Eng 1',
      Mentor_Name: 'Ada',
      attritionDowngraded: true,
      failedResponsibilities: ['Is Independent'],
      Project_Projections_Current: true,
      Overall_Score: 5,
      isDeparted: false,
    }
    expect(buildPersonAction(person, { roster: [person] })).toBe(
      "Status follows Ada's departure.",
    )
  })

  it('marks a single point that the full roster does not have', () => {
    const strong = (name, id) => ({
      id,
      Employee_Name: name,
      Client: 'Client A',
      isDeparted: false,
      SMT_8_Known: true,
      Platform_Score: 9,
      Max_V93k: 8,
      ragStatus: 'GREEN',
      failedResponsibilities: [],
      Project_Projections_Current: true,
      Role: 'Eng 2',
      Overall_Score: 8,
      Allocation_Status: 'Project',
      Billing_Months_Remaining: 4,
    })
    const full = [strong('Ann', '1'), strong('Bea', '2')]
    const view = [full[0]]
    const note = buildClientBriefs(view, 'All', full)[0].spofNote
    expect(note).toMatch(/this view/)
    expect(note).toMatch(/not a single point/)
    expect(
      buildPersonAction(full[0], {
        roster: full,
        spof: { viewCount: 1, fullCount: 2 },
      }),
    ).toBe(
      'Client A has 1 high-skill person in this view. The full roster is not a single point.',
    )
  })

  it('names a bench person only when their skill matches a hole', () => {
    const onProject = {
      id: 'p',
      Employee_Name: 'Pat',
      Client: 'Client Q',
      Allocation_Status: 'Project',
      isDeparted: false,
      Platform_Score: 2,
      ragStatus: 'GREEN',
      Role: 'Eng 1',
      Overall_Score: 6,
      failedResponsibilities: [],
      Project_Projections_Current: true,
      Billing_Months_Remaining: 5,
      CONT_Status: 'Debug',
    }
    const bench = {
      id: 'b',
      Employee_Name: 'Bea',
      Client: 'Client A',
      Allocation_Status: 'Bench',
      isDeparted: false,
      SMT_8_Known: true,
      Platform_Score: 9,
      Max_V93k: 8,
      ragStatus: 'GREEN',
      Role: 'Eng 2',
      Overall_Score: 8,
      failedResponsibilities: [],
      Project_Projections_Current: true,
      Billing_Months_Remaining: 0,
    }
    const matched = buildWorklist([onProject, bench])
    const benchLines = matched.find((group) => group.id === 'bench').items
    expect(
      benchLines.some(
        (item) => item.text.includes('Bea') && item.text.includes('Client Q'),
      ),
    ).toBe(true)

    const idle = {
      ...bench,
      id: 'n',
      Employee_Name: 'Ned',
      SMT_8_Known: false,
      Platform_Score: 2,
      Max_V93k: 1,
    }
    const unmatched = buildWorklist([onProject, idle])
    expect(
      unmatched
        .find((group) => group.id === 'bench')
        .items.some((item) => item.text.includes('Ned')),
    ).toBe(false)
  })

  it('books a project person under 2 months and skips the bench', () => {
    const project = {
      id: 'p',
      Employee_Name: 'Pat',
      Client: 'Client Q',
      Allocation_Status: 'Project',
      isDeparted: false,
      ragStatus: 'GREEN',
      Role: 'Eng 1',
      Overall_Score: 6,
      failedResponsibilities: [],
      Project_Projections_Current: true,
      Billing_Months_Remaining: 1,
      Upcoming_Commitment: 'Widget',
      Platform_Score: 8,
    }
    const bench = {
      id: 'b',
      Employee_Name: 'Bea',
      Client: 'Client A',
      Allocation_Status: 'Bench',
      isDeparted: false,
      ragStatus: 'GREEN',
      Role: 'Eng 2',
      Overall_Score: 8,
      failedResponsibilities: [],
      Project_Projections_Current: true,
      Billing_Months_Remaining: 0,
      Platform_Score: 3,
    }
    const booking = buildWorklist([project, bench]).find(
      (group) => group.id === 'booking',
    ).items
    expect(booking.map((item) => item.text)).toEqual([
      'Pat has 1 month of billing left. Next booking: Widget.',
    ])
  })

  it('gives a leader with no reports a shape line and no score', () => {
    const loner = {
      id: 'L',
      Employee_Name: 'Lou',
      Role: 'Lead',
      Client: 'Client Q',
      isDeparted: false,
      ragStatus: 'GREEN',
      Reports_To: '',
      Mentor_Name: 'Ada',
      failedResponsibilities: [],
      Overall_Score: 8,
      Allocation_Status: 'Project',
      Billing_Months_Remaining: 6,
      Project_Projections_Current: true,
      Platform_Score: 8,
    }
    const team = buildTeamBrief([loner])
    expect(team.leadership).toEqual([])
    const shape = team.worklist.find((group) => group.id === 'shape').items
    expect(
      shape.some(
        (item) =>
          item.text.includes('Lou') && item.text.includes('no direct reports'),
      ),
    ).toBe(true)
    expect(shape.every((item) => item.score === undefined)).toBe(true)
  })
})
