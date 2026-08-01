import { describe, expect, it } from 'vitest'
import {
  normalizeRole,
  evaluateEmployee,
  evaluateTeam,
  applyHierarchyRag,
  getRoleBaseline,
} from './ragEvaluator'

function baseEmployee(overrides = {}) {
  return {
    id: 'e1',
    Employee_Name: 'Alex',
    Role: 'Eng 2',
    Reports_To: '',
    Mentor_Name: '',
    Client: 'Client Q',
    Project_Type: 'FT',
    Allocation_Status: 'Project',
    Billing_Months_Remaining: 6,
    Upcoming_Commitment: '',
    SMT_Versions_Known: 'Both',
    Other_Testers: true,
    SC_Experience: true,
    SOD_Handling: true,
    CONT_Status: 'Bringup',
    DBD_Bringup: true,
    Product_Focus: 'Both',
    IP_Debug_Level: 'Advanced',
    Client_Demand: 'High',
    Project_Projections_Current: true,
    TML_Scripting: 8,
    CS_ES_HVM_Releases: 8,
    Is_Independent: true,
    Does_Automation_Scripting: true,
    Handles_1_on_1_Mentoring: true,
    Produces_Documentation: true,
    Runs_Classroom_Training: true,
    Manages_Project_Deliverables: true,
    Manages_Multiple_Clients: false,
    isDeparted: false,
    ...overrides,
  }
}

describe('normalizeRole', () => {
  it('maps Sr Manager before generic manager', () => {
    expect(normalizeRole('Sr Manager')).toBe('Sr Manager')
    expect(normalizeRole('Senior Manager')).toBe('Sr Manager')
    expect(normalizeRole('Manager')).toBe('Manager')
  })
})

describe('evaluateEmployee', () => {
  it('marks strong Eng 2 as GREEN when checks pass', () => {
    const result = evaluateEmployee(baseEmployee())
    expect(result.ragStatus).toBe('GREEN')
    expect(result.Overall_Score).toBeGreaterThan(getRoleBaseline('Eng 2') - 0.01)
    expect(result).not.toHaveProperty('Process_Score')
  })

  it('flags failed responsibilities for Eng 2', () => {
    const result = evaluateEmployee(
      baseEmployee({
        Is_Independent: false,
        Does_Automation_Scripting: false,
      }),
    )
    expect(result.failedResponsibilities.length).toBeGreaterThan(0)
    expect(result.ragStatus).not.toBe('GREEN')
  })
})

describe('applyHierarchyRag', () => {
  it('downgrades leader when reports are RED', () => {
    const team = evaluateTeam([
      baseEmployee({
        id: 'mgr',
        Employee_Name: 'LeadOne',
        Role: 'Lead',
        Reports_To: '',
        Manages_Project_Deliverables: true,
      }),
      baseEmployee({
        id: 'r1',
        Employee_Name: 'RepRed',
        Role: 'Eng 1',
        Reports_To: 'LeadOne',
        SMT_Versions_Known: '7',
        CONT_Status: 'No_Idea',
        DBD_Bringup: false,
        SC_Experience: false,
        SOD_Handling: false,
        Other_Testers: false,
        Product_Focus: 'Sustaining',
        IP_Debug_Level: 'None',
        Client_Demand: 'Low',
        Project_Projections_Current: false,
        TML_Scripting: 1,
        CS_ES_HVM_Releases: 1,
        Is_Independent: false,
      }),
      baseEmployee({
        id: 'r2',
        Employee_Name: 'RepRed2',
        Role: 'Eng 1',
        Reports_To: 'LeadOne',
        SMT_Versions_Known: '7',
        CONT_Status: 'No_Idea',
        DBD_Bringup: false,
        SC_Experience: false,
        SOD_Handling: false,
        Other_Testers: false,
        Product_Focus: 'Sustaining',
        IP_Debug_Level: 'None',
        Client_Demand: 'Low',
        Project_Projections_Current: false,
        TML_Scripting: 1,
        CS_ES_HVM_Releases: 1,
        Is_Independent: false,
      }),
    ]).map((e) => ({ ...e, ragStatus: e.baseRagStatus }))

    const after = applyHierarchyRag(team)
    const lead = after.find((e) => e.Employee_Name === 'LeadOne')
    expect(lead.ragStatus).toBe('RED')
    expect(lead.hierarchyAdjusted).toBe(true)
  })
})
