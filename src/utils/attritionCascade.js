const DOWNGRADE = {
  GREEN: 'AMBER',
  AMBER: 'RED',
  RED: 'RED',
}

/**
 * Apply attrition cascade: mentees of departed engineers are downgraded one step
 * when simulation mode is enabled. Direct mentor match only (one hop).
 *
 * @param {object[]} evaluatedEmployees - employees with baseRagStatus / ragStatus
 * @param {boolean} attritionMode
 * @returns {object[]}
 */
export function applyAttritionCascade(evaluatedEmployees, attritionMode) {
  if (!attritionMode) {
    return evaluatedEmployees.map((emp) => ({
      ...emp,
      ragStatus: emp.isDeparted ? emp.baseRagStatus : emp.baseRagStatus,
      attritionDowngraded: false,
    }))
  }

  const departedNames = new Set(
    evaluatedEmployees
      .filter((e) => e.isDeparted)
      .map((e) => String(e.Employee_Name).trim().toLowerCase()),
  )

  return evaluatedEmployees.map((emp) => {
    if (emp.isDeparted) {
      return {
        ...emp,
        ragStatus: emp.baseRagStatus,
        attritionDowngraded: false,
      }
    }

    const mentor = String(emp.Mentor_Name || '').trim().toLowerCase()
    const mentorDeparted = mentor && departedNames.has(mentor)

    if (mentorDeparted) {
      const next = DOWNGRADE[emp.baseRagStatus] || emp.baseRagStatus
      return {
        ...emp,
        ragStatus: next,
        attritionDowngraded: next !== emp.baseRagStatus,
      }
    }

    return {
      ...emp,
      ragStatus: emp.baseRagStatus,
      attritionDowngraded: false,
    }
  })
}
