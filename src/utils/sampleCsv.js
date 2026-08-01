import { SAMPLE_CSV_TEXT } from './sampleCsv.generated.js'

/** Sample CSV text from scripts/generateSampleRoster.mjs (single source). */
export function generateSampleCsvString() {
  return SAMPLE_CSV_TEXT
}

export function downloadSampleCsv() {
  const csv = generateSampleCsvString()
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'sample_team_roster.csv'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
