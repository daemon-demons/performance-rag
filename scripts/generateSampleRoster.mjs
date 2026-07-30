import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { REQUIRED_COLUMNS } from '../src/utils/csvSchema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const names = [
  ['Priya Nair', 'Manager', '', '', 'Qualcomm', 'HVM Support'],
  ['Arjun Mehta', 'Sr Lead', 'Priya Nair', 'Priya Nair', 'Qualcomm', 'New Product Intro'],
  ['Sneha Reddy', 'Lead', 'Arjun Mehta', 'Arjun Mehta', 'Qualcomm', 'Characterization'],
  ['Karthik Iyer', 'Sr Eng 2', 'Sneha Reddy', 'Sneha Reddy', 'NXP', 'Pattern Debug'],
  ['Ananya Krishnan', 'Sr Eng 1', 'Sneha Reddy', 'Karthik Iyer', 'NXP', 'Lab Bringup'],
  ['Rahul Desai', 'Eng 2', 'Karthik Iyer', 'Ananya Krishnan', 'NXP', 'Test Development'],
  ['Meera Joshi', 'Eng 1', 'Karthik Iyer', 'Rahul Desai', 'Infineon', 'Characterization'],
  ['Vikram Rao', 'Eng 2', 'Sneha Reddy', 'Sneha Reddy', 'Infineon', 'Automation'],
  ['Divya Patel', 'Sr Eng 1', 'Arjun Mehta', 'Arjun Mehta', 'Broadcom', 'HVM Support'],
  ['Nikhil Sharma', 'Lead', 'Priya Nair', 'Priya Nair', 'Broadcom', 'New Product Intro'],
  ['Lakshmi Venkat', 'Eng 1', 'Nikhil Sharma', 'Nikhil Sharma', 'Broadcom', 'Test Development'],
  ['Aditya Menon', 'Intern', 'Rahul Desai', 'Meera Joshi', 'Infineon', 'Lab Support'],
  ['Pooja Banerjee', 'Sr Eng 2', 'Nikhil Sharma', 'Nikhil Sharma', 'Qualcomm', 'Multisite Bringup'],
  ['Suresh Kumar', 'Staff', '', '', 'NXP', 'Cross-Client Strategy'],
  ['Ishita Gupta', 'Eng 1', 'Pooja Banerjee', 'Pooja Banerjee', 'Qualcomm', 'GRR Analysis'],
  ['Rohan Kapoor', 'Eng 2', 'Nikhil Sharma', 'Pooja Banerjee', 'Broadcom', 'Scripting'],
  ['Neha Sinha', 'Sr Eng 1', 'Sneha Reddy', 'Sneha Reddy', 'Qualcomm', 'HW Validation'],
  ['Amit Bose', 'Eng 1', 'Ananya Krishnan', 'Ananya Krishnan', 'NXP', 'Bench Setup'],
]

const skills = [
  'Smartest_V7',
  'Smartest_V8',
  'Test_Program_Integration',
  'Test_Program_Development',
  'Pattern_Debugs',
  'Scripting_Tools',
  'Data_Analytics',
  'Version_Control_Git',
  'IP_Knowledge',
  'Post_Silicon_Validation',
  'Bench_Setup_Stabilization',
  'Loadboard_Bringup',
  'HW_Validation',
  'GRR_Analysis',
  'Engineering_Bringups',
  'Multisite_Bringup',
  'TapeOut_To_HVM',
  'Volume_KPI_Analysis',
  'Production_Release_Track',
]

const flags = [
  'Is_Independent',
  'Does_Automation_Scripting',
  'Handles_1_on_1_Mentoring',
  'Produces_Documentation',
  'Runs_Classroom_Training',
  'Manages_Project_Deliverables',
  'Manages_Multiple_Clients',
]

const roleBias = {
  Intern: [2, 5],
  'Eng 1': [3, 6],
  'Eng 2': [4, 7],
  'Sr Eng 1': [5, 8],
  'Sr Eng 2': [6, 9],
  Lead: [7, 9],
  'Sr Lead': [8, 10],
  Manager: [7, 10],
  Staff: [8, 10],
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function chance(p) {
  return Math.random() < p
}

function esc(v) {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function bool(v) {
  return v ? 'TRUE' : 'FALSE'
}

const rows = names.map(
  ([Employee_Name, Role, Reports_To, Mentor_Name, Client, Project_Type]) => {
    const [lo, hi] = roleBias[Role] || [4, 8]
    const row = {
      Employee_Name,
      Role,
      Reports_To,
      Mentor_Name,
      Client,
      Project_Type,
    }
    for (const s of skills) {
      row[s] = Math.min(10, Math.max(1, rand(lo, hi) + rand(-1, 1)))
    }
    row.Is_Independent = !['Intern'].includes(Role)
      ? chance(Role.startsWith('Eng 1') ? 0.7 : 0.9)
      : chance(0.2)
    row.Does_Automation_Scripting = chance(
      ['Eng 2', 'Sr Eng 1', 'Sr Eng 2', 'Lead', 'Sr Lead', 'Manager', 'Staff'].includes(
        Role,
      )
        ? 0.85
        : 0.35,
    )
    row.Handles_1_on_1_Mentoring = chance(
      ['Sr Eng 1', 'Sr Eng 2', 'Lead', 'Sr Lead', 'Manager', 'Staff'].includes(Role)
        ? 0.8
        : 0.15,
    )
    row.Produces_Documentation = chance(
      ['Sr Eng 1', 'Sr Eng 2', 'Lead', 'Sr Lead', 'Manager', 'Staff'].includes(Role)
        ? 0.75
        : 0.25,
    )
    row.Runs_Classroom_Training = chance(
      ['Sr Eng 2', 'Lead', 'Sr Lead', 'Manager', 'Staff'].includes(Role) ? 0.6 : 0.1,
    )
    row.Manages_Project_Deliverables = chance(
      ['Lead', 'Sr Lead', 'Manager', 'Staff'].includes(Role) ? 0.85 : 0.1,
    )
    row.Manages_Multiple_Clients = chance(
      ['Sr Lead', 'Manager', 'Staff'].includes(Role) ? 0.8 : 0.05,
    )
    return row
  },
)

const lines = [REQUIRED_COLUMNS.join(',')]
for (const row of rows) {
  lines.push(
    REQUIRED_COLUMNS.map((c) =>
      flags.includes(c) ? bool(row[c]) : esc(row[c] ?? ''),
    ).join(','),
  )
}
const csv = `${lines.join('\n')}\n`

const targets = [
  path.join(root, 'sample', 'sample_team_roster.csv'),
  path.join(root, 'public', 'sample', 'sample_team_roster.csv'),
]

for (const target of targets) {
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, csv, 'utf8')
}

console.log(`Wrote ${rows.length} rows to sample/ and public/sample/`)
