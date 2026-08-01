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
      } else {
        out[col] = val
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
 * Write roster to linked file handle, or download as fallback.
 * @returns {{ method: 'file' | 'download', filename?: string, error?: string }}
 */
export async function persistRoster(employees, fileHandle) {
  const csv = employeesToCsv(employees)
  if (fileHandle) {
    try {
      const writable = await fileHandle.createWritable()
      await writable.write(csv)
      await writable.close()
      return { method: 'file' }
    } catch (err) {
      const error =
        err instanceof Error ? err.message : 'Could not write linked file'
      downloadCsvText(csv, 'team_roster.csv')
      return {
        method: 'download',
        filename: 'team_roster.csv',
        error,
      }
    }
  }
  downloadCsvText(csv, 'team_roster.csv')
  return { method: 'download', filename: 'team_roster.csv' }
}
