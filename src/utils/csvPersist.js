import Papa from 'papaparse'
import {
  REQUIRED_COLUMNS,
  BOOLEAN_COLUMNS,
  OPTIONAL_BOOLEAN_COLUMNS,
  CSV_OUTPUT_COLUMNS,
} from './csvSchema'

function boolToCsv(value) {
  return value ? 'TRUE' : 'FALSE'
}

/** Keep a cell from being read as a formula when the file is opened in a spreadsheet. */
function csvSafe(value) {
  const text = String(value)
  if (/^[=+\-@\t\r]/.test(text)) return `'${text}`
  return text
}

/** Serialize raw employee records back to CSV text (schema + Is_Departed). */
export function employeesToCsv(employees) {
  const data = (employees || []).map((row) => {
    const out = {}
    for (const col of REQUIRED_COLUMNS) {
      const val = row[col]
      if (BOOLEAN_COLUMNS.includes(col)) {
        out[col] = boolToCsv(Boolean(val))
      } else if (val === null || val === undefined) {
        out[col] = ''
      } else if (typeof val === 'number') {
        out[col] = Number.isFinite(val) ? val : ''
      } else {
        out[col] = csvSafe(val)
      }
    }
    for (const col of OPTIONAL_BOOLEAN_COLUMNS) {
      if (col === 'Is_Departed') {
        out[col] = boolToCsv(Boolean(row.isDeparted))
      } else {
        out[col] = boolToCsv(Boolean(row[col]))
      }
    }
    return out
  })
  return Papa.unparse(data, { columns: CSV_OUTPUT_COLUMNS })
}

export function downloadCsvText(csv, filename = 'team_roster.csv') {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export function supportsFileSystemAccess() {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window
}

/** Open a CSV via File System Access API and return { file, handle }. */
export async function openCsvWithHandle() {
  if (!supportsFileSystemAccess()) {
    throw new Error('File System Access API is not available in this browser.')
  }
  const [handle] = await window.showOpenFilePicker({
    multiple: false,
    types: [
      {
        description: 'CSV',
        accept: { 'text/csv': ['.csv'] },
      },
    ],
  })
  const file = await handle.getFile()
  return { file, handle }
}

/**
 * Overwrite the linked roster file. Never downloads.
 * No handle means the roster stays in memory until an explicit export.
 * @returns {{ method: 'file' | 'memory' | 'error', error?: string }}
 */
export async function writeLinkedRoster(employees, fileHandle) {
  if (!fileHandle) return { method: 'memory' }
  const csv = employeesToCsv(employees)
  try {
    const writable = await fileHandle.createWritable()
    await writable.write(csv)
    await writable.close()
    return { method: 'file' }
  } catch (err) {
    const error =
      err instanceof Error ? err.message : 'Could not write linked file'
    return { method: 'error', error }
  }
}

/** Download the current roster. This is the only export path. */
export function exportRosterCsv(employees, filename = 'team_roster.csv') {
  const csv = employeesToCsv(employees)
  downloadCsvText(csv, filename)
  return { method: 'download', filename }
}
