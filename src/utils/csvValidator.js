import Papa from 'papaparse'
import {
  REQUIRED_COLUMNS,
  NUMERIC_SKILL_COLUMNS,
  BOOLEAN_COLUMNS,
  META_COLUMNS,
  ENUM_COLUMNS,
} from './csvSchema'
import { findReportingCycles } from './orgTree'

function parseBoolean(value) {
  if (typeof value === 'boolean') return value
  if (value === null || value === undefined) return false
  const normalized = String(value).trim().toLowerCase()
  if (['true', '1', 'yes', 'y'].includes(normalized)) return true
  if (['false', '0', 'no', 'n', ''].includes(normalized)) return false
  return Boolean(normalized)
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return 0
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function parseEnum(col, value) {
  const allowed = ENUM_COLUMNS[col] || []
  const raw = String(value ?? '').trim()
  if (!raw) return allowed[0] || ''

  if (col === 'SMT_Versions_Known') {
    const l = raw.toLowerCase().replace(/\s+/g, '')
    if (l === 'both' || l === '7+8' || l === '8+7' || l === '7and8' || l === 'v7v8') {
      return 'Both'
    }
    if (l === '8' || l === 'v8' || l === 'sm8') return '8'
    if (l === '7' || l === 'v7' || l === 'sm7') return '7'
    const n = Number(raw)
    if (Number.isFinite(n)) {
      if (n >= 9) return 'Both'
      if (n >= 8) return '8'
      return '7'
    }
    return '7'
  }

  const match = allowed.find(
    (a) => a.toLowerCase() === raw.toLowerCase().replace(/\s+/g, '_'),
  )
  if (match) return match
  if (col === 'CONT_Status') {
    const l = raw.toLowerCase()
    if (l.includes('bring')) return 'Bringup'
    if (l.includes('debug')) return 'Debug'
    return 'No_Idea'
  }
  if (col === 'Product_Focus') {
    const l = raw.toLowerCase()
    if (l.includes('both')) return 'Both'
    if (l.includes('npi')) return 'NPI'
    return 'Sustaining'
  }
  if (col === 'IP_Debug_Level') {
    const l = raw.toLowerCase()
    if (l.includes('adv')) return 'Advanced'
    if (l.includes('basic')) return 'Basic'
    return 'None'
  }
  if (col === 'Client_Demand') {
    const l = raw.toLowerCase()
    if (l.includes('high')) return 'High'
    if (l.includes('low')) return 'Low'
    return 'Medium'
  }
  if (col === 'Allocation_Status') {
    const l = raw.toLowerCase()
    if (l.includes('bench') || l.includes('idle') || l.includes('available')) {
      return 'Bench'
    }
    return 'Project'
  }
  return allowed[0] || raw
}

function collectWarnings(employees) {
  const warnings = []
  const nameCounts = new Map()
  for (const e of employees) {
    const key = String(e.Employee_Name).trim().toLowerCase()
    nameCounts.set(key, (nameCounts.get(key) || 0) + 1)
  }
  const dupes = [...nameCounts.entries()]
    .filter(([, n]) => n > 1)
    .map(([name]) => name)
  if (dupes.length) {
    warnings.push(
      `Duplicate Employee_Name value(s): ${dupes.slice(0, 5).join(', ')}${
        dupes.length > 5 ? '…' : ''
      }. Hierarchy links use the last matching name.`,
    )
  }
  const cycles = findReportingCycles(employees)
  if (cycles.length) {
    warnings.push(
      `Reporting cycle(s) detected (${cycles.length}). Org walks will break cycles safely.`,
    )
  }
  return warnings
}

/**
 * Validate and parse CSV text with PapaParse (browser-only).
 */
export function validateAndParseCsvText(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return {
      ok: false,
      errors: ['The uploaded file is empty or unreadable.'],
      missingColumns: [],
      warnings: [],
    }
  }

  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  if (parsed.errors?.length) {
    const parseErrors = parsed.errors
      .slice(0, 5)
      .map((e) => e.message || 'Parse error')
    return {
      ok: false,
      errors: ['CSV format appears invalid.', ...parseErrors],
      missingColumns: [],
      warnings: [],
    }
  }

  const headers = parsed.meta?.fields || []
  if (!headers.length) {
    return {
      ok: false,
      errors: ['No header row found. Expected column names in the first row.'],
      missingColumns: [...REQUIRED_COLUMNS],
      warnings: [],
    }
  }

  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => !headers.includes(col),
  )

  if (missingColumns.length) {
    return {
      ok: false,
      errors: [
        `Missing ${missingColumns.length} required column(s).`,
        'Upload a CSV that matches the team schema, or download a sample file.',
      ],
      missingColumns,
      warnings: [],
    }
  }

  const rows = parsed.data || []
  if (!rows.length) {
    return {
      ok: false,
      errors: ['CSV has headers but no employee data rows.'],
      missingColumns: [],
      warnings: [],
    }
  }

  const hasDepartedCol = headers.includes('Is_Departed')

  const employees = rows
    .filter((row) => row.Employee_Name && String(row.Employee_Name).trim())
    .map((row, index) => {
      const employee = {
        id: `emp-${index}-${String(row.Employee_Name).trim()}`,
        isDeparted: hasDepartedCol
          ? parseBoolean(row.Is_Departed)
          : false,
      }

      for (const col of META_COLUMNS) {
        employee[col] = String(row[col] ?? '').trim()
      }

      for (const col of NUMERIC_SKILL_COLUMNS) {
        employee[col] = parseNumber(row[col])
      }

      for (const col of Object.keys(ENUM_COLUMNS)) {
        employee[col] = parseEnum(col, row[col])
      }

      for (const col of BOOLEAN_COLUMNS) {
        employee[col] = parseBoolean(row[col])
      }

      return employee
    })

  if (!employees.length) {
    return {
      ok: false,
      errors: ['No valid employee rows found (Employee_Name is required).'],
      missingColumns: [],
      warnings: [],
    }
  }

  return {
    ok: true,
    employees,
    warnings: collectWarnings(employees),
  }
}

/**
 * Validate and parse a CSV File using FileReader + PapaParse (browser-only).
 */
export function validateAndParseCsv(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve({
        ok: false,
        errors: ['No file provided.'],
        missingColumns: [],
        warnings: [],
      })
      return
    }

    const reader = new FileReader()

    reader.onerror = () => {
      resolve({
        ok: false,
        errors: ['Unable to read the selected file. Please try again.'],
        missingColumns: [],
        warnings: [],
      })
    }

    reader.onload = (event) => {
      resolve(validateAndParseCsvText(event.target?.result))
    }

    reader.readAsText(file)
  })
}
