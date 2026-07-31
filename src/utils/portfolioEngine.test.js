import { describe, it, expect } from 'vitest'
import {
  buildAllocationMix,
  buildFocusMix,
  buildTypeMix,
  buildBillingRunway,
  buildCommitmentSwot,
  buildReadinessSummary,
  listCommitments,
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
    Project_Type: 'NPI',
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
  it('splits project vs bench', () => {
    const mix = buildAllocationMix(sample)
    expect(mix.project).toBe(2)
    expect(mix.bench).toBe(1)
  })

  it('counts focus among project people only', () => {
    const mix = buildFocusMix(sample)
    expect(mix.NPI).toBe(1)
    expect(mix.Sustaining).toBe(1)
    expect(mix.total).toBe(2)
  })

  it('counts FT and WS among project people', () => {
    const mix = buildTypeMix(sample)
    expect(mix.FT).toBe(1)
    expect(mix.WS).toBe(1)
  })

  it('flags low billing runway', () => {
    const runway = buildBillingRunway(sample)
    expect(runway.lowAlerts.some((r) => r.client === 'Client Q')).toBe(true)
  })

  it('lists commitments and builds SWOT', () => {
    expect(listCommitments(sample)).toContain('Q WS bringup')
    const swot = buildCommitmentSwot(sample, 'Q WS bringup')
    expect(swot.strengths.length).toBeGreaterThan(0)
    expect(swot.gaps.length).toBeGreaterThan(0)
    expect(swot.opportunities.some((o) => o.text.includes('Cara'))).toBe(true)
  })

  it('summarizes readiness', () => {
    const r = buildReadinessSummary(sample)
    expect(r.ready).toBe(2)
    expect(r.watch).toBe(1)
  })
})
