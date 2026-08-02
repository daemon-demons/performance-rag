export const REQUIRED_COLUMNS = [
  'Employee_Name',
  'Role',
  'Reports_To',
  'Mentor_Name',
  'Client',
  'Project_Type',
  'Allocation_Status',
  'Billing_Months_Remaining',
  'Upcoming_Commitment',
  'SMT_7_Known',
  'SMT_8_Known',
  'Other_Testers',
  'SC_Experience',
  'SOD_Handling',
  'CONT_Status',
  'DBD_Bringup',
  'Product_Focus',
  'IP_Debug_Level',
  'Client_Demand',
  'Project_Projections_Current',
  'TML_Scripting',
  'CS_ES_HVM_Releases',
  'Is_Independent',
  'Does_Automation_Scripting',
  'Handles_1_on_1_Mentoring',
  'Produces_Documentation',
  'Runs_Classroom_Training',
  'Manages_Project_Deliverables',
  'Manages_Multiple_Clients',
]

export const NUMERIC_SKILL_COLUMNS = [
  'TML_Scripting',
  'CS_ES_HVM_Releases',
  'Billing_Months_Remaining',
]

export const ENUM_COLUMNS = {
  Project_Type: ['WS', 'FT', 'Both'],
  CONT_Status: ['Bringup', 'Debug', 'No_Idea'],
  Product_Focus: ['NPI', 'Sustaining'],
  IP_Debug_Level: ['None', 'Basic', 'Advanced'],
  Client_Demand: ['Low', 'Medium', 'High'],
  Allocation_Status: ['Project', 'Bench'],
}

export const BOOLEAN_COLUMNS = [
  'SMT_7_Known',
  'SMT_8_Known',
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
]

/** Optional: persisted attrition flag (not required on upload). */
export const OPTIONAL_BOOLEAN_COLUMNS = ['Is_Departed']

/** Columns written by employeesToCsv (required + optional). */
export const CSV_OUTPUT_COLUMNS = [
  ...REQUIRED_COLUMNS,
  ...OPTIONAL_BOOLEAN_COLUMNS,
]

export const META_COLUMNS = [
  'Employee_Name',
  'Role',
  'Reports_To',
  'Mentor_Name',
  'Client',
  'Upcoming_Commitment',
]

/** Allowed Project_Type values for a given Product_Focus. */
export function allowedProjectTypes(focus) {
  if (focus === 'NPI') return ['WS', 'FT']
  return ['WS', 'FT', 'Both']
}

/** Human labels for RAG status */
export const RAG_LABELS = {
  GREEN: 'Ready',
  AMBER: 'Watch',
  RED: 'At risk',
}
