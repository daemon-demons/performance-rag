import { describe, it, expect } from 'vitest'
import {
  buildBillingRunway,
  buildReadinessSummary,
  buildBookedByClient,
  buildAttentionList,
} from './portfolioEngine.js'

const sample = [
  {
    id: '1',
    Employee_Name: 'Alice',
    Role: 'Lead',
    Client: 'Client Q',
    Project_Type: 'WS',
    Allocation_Status: 'Project',
    Billing_Months_Remaining: 5,
    Upcoming_Commitment: 'Q WS bringup',
    Product_Focus: 'NPI',
    SC_Experience: true,
    SOD_Handling: false,
    CONT_Status: 'Bringup',
    Max_V93k: 8,
    Platform_Score: 8,
    ragStatus: 'GREEN',
    failedResponsibilities: [],
    isDeparted: false,
  },
  {
    id: '2',
    Employee_Name: 'Bob',
    Role: 'Eng 1',
    Client: 'Client Q',
    Project_Type: 'FT',
    Allocation_Status: 'Project',
    Billing_Months_Remaining: 1,
    Upcoming_Commitment: 'Q WS bringup',
    Product_Focus: 'Sustaining',
    SC_Experience: false,
    SOD_Handling: true,
    CONT_Status: 'Debug',
    Max_V93k: 7,
    Platform_Score: 5,
    ragStatus: 'AMBER',
    failedResponsibilities: ['Is Independent'],
    isDeparted: false,
  },
  {
    id: '3',
    Employee_Name: 'Cara',
    Role: 'Eng 1',
    Client: 'Client A',
    Project_Type: 'FT',
    Allocation_Status: 'Bench',
    Billing_Months_Remaining: 0,
    Upcoming_Commitment: 'Q WS bringup',
    Product_Focus: 'NPI',
    SC_Experience: true,
    SOD_Handling: true,
    CONT_Status: 'Bringup',
    Max_V93k: 8,
    Platform_Score: 7,
    ragStatus: 'GREEN',
    failedResponsibilities: [],
    isDeparted: false,
  },
]

describe('portfolioEngine', () => {
  it('flags low billing runway', () => {
    const runway = buildBillingRunway(sample)
    expect(runway.lowAlerts.some((r) => r.client === 'Client Q')).toBe(true)
    const clientQ = runway.chart.find((r) => r.name === 'Client Q')
    expect(clientQ.shortest).toBe(1)
    expect(clientQ.months).toBe(3)
  })

  it('splits booked work by client and ignores bench', () => {
    const booked = buildBookedByClient(sample)
    expect(booked.chart).toEqual([
      { name: 'Client Q', NPI: 1, Sustaining: 1, FT: 1, WS: 1, Both: 0 },
    ])
  })

  it('summarizes readiness', () => {
    const r = buildReadinessSummary(sample)
    expect(r.ready).toBe(2)
    expect(r.watch).toBe(1)
  })

  it('lists people who need monitoring and keeps billing months', () => {
    const people = [
      {
        id: 'ready',
        Employee_Name: 'Ready Pat',
        Client: 'Client Q',
        Billing_Months_Remaining: 8,
        ragStatus: 'GREEN',
        Project_Projections_Current: true,
        failedResponsibilities: [],
        isDeparted: false,
      },
      {
        id: 'risk',
        Employee_Name: 'Rita',
        Client: 'Client A',
        Billing_Months_Remaining: 4,
        ragStatus: 'RED',
        Project_Projections_Current: true,
        failedResponsibilities: [],
        isDeparted: false,
      },
      {
        id: 'stale',
        Employee_Name: 'Sam',
        Client: 'Client Q',
        Billing_Months_Remaining: 6,
        ragStatus: 'GREEN',
        Project_Projections_Current: false,
        failedResponsibilities: [],
        isDeparted: false,
      },
      {
        id: 'spof-person',
        Employee_Name: 'Ada',
        Client: 'Client G',
        Billing_Months_Remaining: 3,
        ragStatus: 'GREEN',
        Project_Projections_Current: true,
        failedResponsibilities: [],
        isDeparted: false,
      },
      {
        id: 'failed',
        Employee_Name: 'Finn',
        Client: 'Client Q',
        Billing_Months_Remaining: 2,
        ragStatus: 'AMBER',
        Project_Projections_Current: true,
        failedResponsibilities: ['Is Independent'],
        isDeparted: false,
      },
      {
        id: 'gone',
        Employee_Name: 'Gone',
        Client: 'Client A',
        Billing_Months_Remaining: 1,
        ragStatus: 'RED',
        Project_Projections_Current: false,
        failedResponsibilities: ['Is Independent'],
        isDeparted: true,
      },
    ]

    const attention = buildAttentionList(people, [{ client: 'Client G' }])
    const names = attention.groups.flatMap((group) =>
      group.people.map((person) => person.name),
    )

    expect(names).not.toContain('Ready Pat')
    expect(names).not.toContain('Gone')
    expect(attention.groups.map((group) => group.client)).toEqual([
      'Client A',
      'Client G',
      'Client Q',
    ])

    const rita = attention.groups[0].people[0]
    expect(rita.name).toBe('Rita')
    expect(rita.billingMonths).toBe(4)
    expect(rita.reasons.map((reason) => reason.id)).toEqual(['at-risk'])

    const ada = attention.groups
      .find((group) => group.client === 'Client G')
      .people[0]
    expect(ada.reasons.map((reason) => reason.id)).toEqual(['spof'])
    expect(ada.billingMonths).toBe(3)

    const clientQ = attention.groups.find((group) => group.client === 'Client Q')
    expect(clientQ.people.map((person) => person.name)).toEqual(['Finn', 'Sam'])
    expect(clientQ.people[0].reasons).toEqual([{ id: 'failed', count: 1 }])
    expect(clientQ.people[0].billingMonths).toBe(2)
    expect(clientQ.people[1].reasons.map((reason) => reason.id)).toEqual([
      'projections',
    ])
    expect(clientQ.people[1].billingMonths).toBe(6)
  })
})
