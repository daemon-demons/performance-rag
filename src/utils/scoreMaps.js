/** Shared enum → numeric maps for scoring, radar, and analytics. */

export const CONT_MAP = { Bringup: 8, Debug: 5, No_Idea: 1 }
export const PRODUCT_MAP = { NPI: 7, Sustaining: 6 }
export const IP_MAP = { None: 2, Basic: 5, Advanced: 9 }
export const DEMAND_MAP = { Low: 4, Medium: 6, High: 9 }

/**
 * SMT readiness from SMT_7_Known / SMT_8_Known flags.
 * both → 10; only 8 → 8; only 7 → 7; neither → 1
 */
export function smtStrength(employee) {
  const v7 = Boolean(employee?.SMT_7_Known)
  const v8 = Boolean(employee?.SMT_8_Known)
  if (v7 && v8) return 10
  if (v8) return 8
  if (v7) return 7
  return 1
}

/** At least one SMT version known. */
export function smtGateMet(employee) {
  return Boolean(employee?.SMT_7_Known) || Boolean(employee?.SMT_8_Known)
}

/** High-skill SPOF predicate: strong SMT or platform. */
export function isHighSkill(employee) {
  const smt = employee?.Max_V93k ?? smtStrength(employee)
  const platform = employee?.Platform_Score ?? 0
  return smt >= 8 || platform >= 8
}
