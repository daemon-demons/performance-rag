export const REQUIRED_COLUMNS = [
  'Employee_Name',
  'Role',
  'Reports_To',
  'Mentor_Name',
  'Client',
  'Project_Type',
  'SMT_Versions_Known',
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
]

export const ENUM_COLUMNS = {
  /** Base 93k tester SM versions: 7, 8, or Both only */
  SMT_Versions_Known: ['7', '8', 'Both'],
  CONT_Status: ['Bringup', 'Debug', 'No_Idea'],
  Product_Focus: ['NPI', 'Sustaining', 'Both'],
  IP_Debug_Level: ['None', 'Basic', 'Advanced'],
  Client_Demand: ['Low', 'Medium', 'High'],
}

export const BOOLEAN_COLUMNS = [
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

export const META_COLUMNS = [
  'Employee_Name',
  'Role',
  'Reports_To',
  'Mentor_Name',
  'Client',
  'Project_Type',
]

export const SKILL_CHART_KEYS = [
  { key: 'Max_V93k', label: 'SMT (93k)' },
  { key: 'TML_Scripting', label: 'TML/Script' },
  { key: 'CS_ES_HVM_Releases', label: 'CS/ES HVM' },
  { key: 'Platform_Score', label: 'Platform' },
  { key: 'Delivery_Score', label: 'Delivery' },
  { key: 'Depth_Score', label: 'Depth' },
]
