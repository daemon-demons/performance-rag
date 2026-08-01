import { ENUM_COLUMNS, BOOLEAN_COLUMNS } from '../../utils/csvSchema'
import {
  CONT_MAP,
  PRODUCT_MAP,
  IP_MAP,
  DEMAND_MAP,
} from '../../utils/scoreMaps'
import { ROLE_OPTIONS } from '../../utils/ragEvaluator'

export { ROLE_OPTIONS }

export const PROJECT_TYPES = [
  'FT',
  'WS',
  'NPI',
  'Sustaining',
  'HVM Support',
  'Other',
]

export const fieldClass =
  'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 shadow-sm transition focus:border-tessolve-blue focus:outline-none focus:ring-2 focus:ring-tessolve-blue/20'

export const EDITABLE_KEYS = [
  'Role',
  'Reports_To',
  'Mentor_Name',
  'Client',
  'Project_Type',
  'Allocation_Status',
  'Billing_Months_Remaining',
  'Upcoming_Commitment',
  ...Object.keys(ENUM_COLUMNS).filter((k) => k !== 'Allocation_Status'),
  'TML_Scripting',
  'CS_ES_HVM_Releases',
  ...BOOLEAN_COLUMNS,
]

export function snapshotEmployee(emp) {
  const snap = {}
  for (const key of EDITABLE_KEYS) {
    snap[key] = emp[key]
  }
  snap.isDeparted = Boolean(emp.isDeparted)
  return snap
}

export function radarAxes(emp) {
  return [
    { skill: 'SMT', value: emp.Max_V93k ?? 0 },
    { skill: 'Other', value: emp.Other_Testers ? 8 : 0 },
    { skill: 'CONT', value: CONT_MAP[emp.CONT_Status] ?? 0 },
    { skill: 'DBD', value: emp.DBD_Bringup ? 8 : 0 },
    { skill: 'SC', value: emp.SC_Experience ? 8 : 0 },
    { skill: 'SOD', value: emp.SOD_Handling ? 8 : 0 },
    { skill: 'Product', value: PRODUCT_MAP[emp.Product_Focus] ?? 0 },
    { skill: 'Demand', value: DEMAND_MAP[emp.Client_Demand] ?? 0 },
    { skill: 'Proj', value: emp.Project_Projections_Current ? 8 : 0 },
    { skill: 'TML', value: Number(emp.TML_Scripting) || 0 },
    { skill: 'HVM', value: Number(emp.CS_ES_HVM_Releases) || 0 },
    { skill: 'IP', value: IP_MAP[emp.IP_Debug_Level] ?? 0 },
  ]
}
