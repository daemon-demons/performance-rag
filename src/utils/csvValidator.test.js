import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { REQUIRED_COLUMNS, CSV_OUTPUT_COLUMNS } from './csvSchema'
import { validateAndParseCsvText } from './csvValidator'
import { employeesToCsv } from './csvPersist'
import { generateSampleCsvString } from './sampleCsv'

const samplePath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../public/sample/sample_team_roster.csv',
)

describe('csvValidator', () => {
  it('accepts committed sample CSV with all required columns', () => {
    const text = readFileSync(samplePath, 'utf8')
    const result = validateAndParseCsvText(text)
    expect(result.ok).toBe(true)
    expect(result.employees.length).toBeGreaterThan(0)
    for (const col of REQUIRED_COLUMNS) {
      expect(text.split('\n')[0]).toContain(col)
    }
  })

  it('parses optional Is_Departed', () => {
    const header = CSV_OUTPUT_COLUMNS.join(',')
    const row = CSV_OUTPUT_COLUMNS.map((c) => {
      if (c === 'Employee_Name') return 'Pat'
      if (c === 'Role') return 'Eng 1'
      if (c === 'Is_Departed') return 'TRUE'
      if (c === 'SMT_Versions_Known') return '7'
      if (c === 'CONT_Status') return 'Debug'
      if (c === 'Product_Focus') return 'NPI'
      if (c === 'IP_Debug_Level') return 'None'
      if (c === 'Client_Demand') return 'Low'
      if (c === 'Allocation_Status') return 'Project'
      if (c === 'Billing_Months_Remaining') return '1'
      if (c === 'TML_Scripting' || c === 'CS_ES_HVM_Releases') return '3'
      if (
        [
          'Other_Testers',
          'SC_Experience',
          'SOD_Handling',
          'DBD_Bringup',
          'Project_Projections_Current',
          'Is_Independent',
          'Does_Automation_Scripting',
          'Handles_1_on_1_Mentoring',
          'Produces_Documentation',
          'Runs_Classroom_Training',
          'Manages_Project_Deliverables',
          'Manages_Multiple_Clients',
        ].includes(c)
      ) {
        return 'FALSE'
      }
      return ''
    }).join(',')
    const result = validateAndParseCsvText(`${header}\n${row}\n`)
    expect(result.ok).toBe(true)
    expect(result.employees[0].isDeparted).toBe(true)
  })

  it('round-trips Is_Departed through employeesToCsv', () => {
    const csv = employeesToCsv([
      {
        Employee_Name: 'Pat',
        Role: 'Eng 1',
        Reports_To: '',
        Mentor_Name: '',
        Client: 'X',
        Project_Type: 'FT',
        Allocation_Status: 'Project',
        Billing_Months_Remaining: 2,
        Upcoming_Commitment: '',
        SMT_Versions_Known: '7',
        Other_Testers: false,
        SC_Experience: false,
        SOD_Handling: false,
        CONT_Status: 'Debug',
        DBD_Bringup: false,
        Product_Focus: 'NPI',
        IP_Debug_Level: 'None',
        Client_Demand: 'Low',
        Project_Projections_Current: false,
        TML_Scripting: 2,
        CS_ES_HVM_Releases: 2,
        Is_Independent: true,
        Does_Automation_Scripting: false,
        Handles_1_on_1_Mentoring: false,
        Produces_Documentation: false,
        Runs_Classroom_Training: false,
        Manages_Project_Deliverables: false,
        Manages_Multiple_Clients: false,
        isDeparted: true,
      },
    ])
    expect(csv.split('\n')[0]).toContain('Is_Departed')
    const again = validateAndParseCsvText(csv)
    expect(again.ok).toBe(true)
    expect(again.employees[0].isDeparted).toBe(true)
  })

  it('matches generated sample embed to required headers', () => {
    const generated = generateSampleCsvString()
    const header = generated.trim().split('\n')[0]
    for (const col of REQUIRED_COLUMNS) {
      expect(header).toContain(col)
    }
    expect(header).toContain('Is_Departed')
  })

  it('warns on duplicate names', () => {
    const text = generateSampleCsvString()
    const lines = text.trim().split('\n')
    const dup = `${lines[0]}\n${lines[1]}\n${lines[1]}\n`
    const result = validateAndParseCsvText(dup)
    expect(result.ok).toBe(true)
    expect(result.warnings?.some((w) => /Duplicate/i.test(w))).toBe(true)
  })
})
