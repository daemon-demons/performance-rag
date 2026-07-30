import Papa from 'papaparse'
import {
  REQUIRED_COLUMNS,
  SKILL_COLUMNS,
  BOOLEAN_COLUMNS,
  META_COLUMNS,
} from './csvSchema'

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

/**
 * Validate and parse CSV text with PapaParse (browser-only).
 * @param {string} text
 * @returns {{ ok: true, employees: object[] } | { ok: false, errors: string[], missingColumns: string[] }}
 */
export function validateAndParseCsvText(text) {
  if (typeof text !== 'string' || !text.trim()) {
    return {
      ok: false,
      errors: ['The uploaded file is empty or unreadable.'],
      missingColumns: [],
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
    }
  }

  const headers = parsed.meta?.fields || []
  if (!headers.length) {
    return {
      ok: false,
      errors: ['No header row found. Expected column names in the first row.'],
      missingColumns: [...REQUIRED_COLUMNS],
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
        'Upload a CSV that matches the Tessolve team schema, or download a sample file.',
      ],
      missingColumns,
    }
  }

  const rows = parsed.data || []
  if (!rows.length) {
    return {
      ok: false,
      errors: ['CSV has headers but no employee data rows.'],
      missingColumns: [],
    }
  }

  const employees = rows
    .filter((row) => row.Employee_Name && String(row.Employee_Name).trim())
    .map((row, index) => {
      const employee = {
        id: `emp-${index}-${String(row.Employee_Name).trim()}`,
        isDeparted: false,
      }

      for (const col of META_COLUMNS) {
        employee[col] = String(row[col] ?? '').trim()
      }

      for (const col of SKILL_COLUMNS) {
        employee[col] = parseNumber(row[col])
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
    }
  }

  return { ok: true, employees }
}

/**
 * Validate and parse a CSV File using FileReader + PapaParse (browser-only).
 * @param {File} file
 * @returns {Promise<{ ok: true, employees: object[] } | { ok: false, errors: string[], missingColumns: string[] }>}
 */
export function validateAndParseCsv(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve({
        ok: false,
        errors: ['No file provided.'],
        missingColumns: [],
      })
      return
    }

    const reader = new FileReader()

    reader.onerror = () => {
      resolve({
        ok: false,
        errors: ['Unable to read the selected file. Please try again.'],
        missingColumns: [],
      })
    }

    reader.onload = (event) => {
      resolve(validateAndParseCsvText(event.target?.result))
    }

    reader.readAsText(file)
  })
}
