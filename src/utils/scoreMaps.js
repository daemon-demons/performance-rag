/** Shared enum → numeric maps for scoring, radar, and analytics. */

export const CONT_MAP = { Bringup: 8, Debug: 5, No_Idea: 1 }
export const PRODUCT_MAP = { NPI: 7, Sustaining: 6, Both: 9 }
export const IP_MAP = { None: 2, Basic: 5, Advanced: 9 }
export const DEMAND_MAP = { Low: 4, Medium: 6, High: 9 }
/** Base 93k SM versions → score for Platform / Max_V93k */
export const SMT_MAP = { '7': 7, '8': 8, Both: 10 }

/** High-skill SPOF predicate: strong SMT or platform. */
export function isHighSkill(employee) {
  const smt = employee?.Max_V93k ?? 0
  const platform = employee?.Platform_Score ?? 0
  return smt >= 8 || platform >= 8
}
