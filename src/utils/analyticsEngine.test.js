import { describe, it, expect } from 'vitest'
import {
  buildSkillHeatmap,
  buildRoleFunnel,
  buildMentorLoad,
  buildCapabilitySpof,
  buildAutoInsights,
  buildLeadershipScores,
} from './analyticsEngine.js'
import { evaluateTeam, applyHierarchyRag } from './ragEvaluator.js'
import { applyAttritionCascade } from './attritionCascade.js'

const sample = [
  {
    id: '1',
    Employee_Name: 'LeadA',
    Role: 'Lead',
    Reports_To: '',
    Mentor_Name: '',
    Client: 'Client Q',
    Project_Type: 'WS',
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
  },
  {
    id: '2',
    Employee_Name: 'EngB',
    Role: 'Eng 1',
    Reports_To: 'LeadA',
    Mentor_Name: 'LeadA',
    Client: 'Client Q',
    Project_Type: 'FT',
    SMT_Versions_Known: '7',
    Other_Testers: false,
    SC_Experience: false,
    SOD_Handling: true,
    CONT_Status: 'Debug',
    DBD_Bringup: false,
    Product_Focus: 'NPI',
    IP_Debug_Level: 'Basic',
    Client_Demand: 'Medium',
    Project_Projections_Current: false,
    TML_Scripting: 4,
    CS_ES_HVM_Releases: 3,
    Is_Independent: false,
    Does_Automation_Scripting: false,
    Handles_1_on_1_Mentoring: false,
    Produces_Documentation: false,
    Runs_Classroom_Training: false,
    Manages_Project_Deliverables: false,
    Manages_Multiple_Clients: false,
    isDeparted: false,
  },
]

function evaluated() {
  return applyHierarchyRag(applyAttritionCascade(evaluateTeam(sample), true))
}

describe('analyticsEngine', () => {
  it('builds heatmap with SC and SOD columns', () => {
    const rows = buildSkillHeatmap(evaluated())
    expect(rows).toHaveLength(2)
    expect(rows[0].cells.sc).toBeGreaterThan(0)
    expect(rows[1].cells.sod).toBeGreaterThan(0)
  })

  it('builds role funnel', () => {
    const funnel = buildRoleFunnel(evaluated())
    expect(funnel.some((r) => r.role === 'Lead')).toBe(true)
    expect(funnel.some((r) => r.role === 'Eng 1')).toBe(true)
  })

  it('builds mentor load', () => {
    const mentors = buildMentorLoad(evaluated())
    expect(mentors[0].mentor).toBe('LeadA')
    expect(mentors[0].menteeCount).toBe(1)
  })

  it('flags capability SPOF', () => {
    const caps = buildCapabilitySpof(evaluated())
    expect(caps[0].client).toBe('Client Q')
    expect(Array.isArray(caps[0].flags)).toBe(true)
  })

  it('emits auto insights', () => {
    const caps = buildCapabilitySpof(evaluated())
    const insights = buildAutoInsights(evaluated(), caps)
    expect(insights.length).toBeGreaterThan(0)
  })

  it('scores leadership', () => {
    const leaders = buildLeadershipScores(evaluated())
    expect(leaders.some((l) => l.name === 'LeadA')).toBe(true)
  })
})

describe('ragEvaluator schema fields', () => {
  it('scores SC_Experience and SOD_Handling separately', () => {
    const [lead] = evaluateTeam(sample)
    expect(lead.Platform_Score).toBeGreaterThan(0)
    expect(lead.SC_Experience).toBe(true)
    expect(lead.SOD_Handling).toBe(true)
  })
})
