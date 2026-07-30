import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Download, Cpu, Play } from 'lucide-react'
import DropzoneUpload from './DropzoneUpload'
import {
  validateAndParseCsv,
  validateAndParseCsvText,
} from '../../utils/csvValidator'
import { downloadSampleCsv } from '../../utils/sampleCsv'
import { useApp } from '../../context/AppContext'

const DEMO_SAMPLE_URL = `${import.meta.env.BASE_URL}sample/sample_team_roster.csv`

export default function WelcomeScreen() {
  const { loadEmployees } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const applyParseResult = (result) => {
    if (!result.ok) {
      setError({
        messages: result.errors,
        missingColumns: result.missingColumns || [],
      })
      return false
    }
    loadEmployees(result.employees)
    navigate('/roster')
    return true
  }

  const handleFile = async (file) => {
    setLoading(true)
    setError(null)
    try {
      const result = await validateAndParseCsv(file)
      applyParseResult(result)
    } catch (err) {
      setError({
        messages: [err?.message || 'Unexpected error while parsing CSV.'],
        missingColumns: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLoadDemo = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(DEMO_SAMPLE_URL)
      if (!response.ok) {
        throw new Error(
          `Could not load demo sample (${response.status}). Ensure sample/sample_team_roster.csv is available.`,
        )
      }
      const text = await response.text()
      applyParseResult(validateAndParseCsvText(text))
    } catch (err) {
      setError({
        messages: [err?.message || 'Failed to load demo sample roster.'],
        missingColumns: [],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 10% 20%, rgba(242,128,43,0.18), transparent), radial-gradient(ellipse 70% 50% at 90% 10%, rgba(35,166,227,0.2), transparent), linear-gradient(160deg, #0b1c2c 0%, #12263a 45%, #1a3348 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-tessolve-orange to-tessolve-blue shadow-lg">
            <Cpu className="text-white" size={22} />
          </div>
          <div>
            <p className="font-display text-sm font-semibold tracking-wide text-tessolve-orange uppercase">
              Tessolve
            </p>
            <p className="text-xs text-slate-300">
              Semiconductor Test Engineering · Performance RAG
            </p>
          </div>
        </div>

        <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          Welcome{' '}
          <span className="bg-gradient-to-r from-tessolve-orange to-tessolve-blue bg-clip-text text-transparent">
            Rajmohan
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-slate-300 sm:text-lg">
          Load your team roster CSV to evaluate skills, responsibilities, and
          client risk — entirely on this device.
        </p>

        <div className="mt-10">
          <DropzoneUpload onFile={handleFile} disabled={loading} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleLoadDemo}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-tessolve-blue px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-tessolve-blue-dark disabled:opacity-60"
          >
            <Play size={16} />
            Run demo with sample roster
          </button>
          <button
            type="button"
            onClick={downloadSampleCsv}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-60"
          >
            <Download size={16} />
            Download sample CSV
          </button>
        </div>

        {loading && (
          <p className="mt-4 text-center text-sm text-sky-200">
            Validating and evaluating roster…
          </p>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/40 bg-red-950/40 p-5 text-left backdrop-blur">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 shrink-0 text-red-400" size={22} />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-semibold text-red-200">
                  CSV validation failed
                </h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-100/90">
                  {error.messages.map((msg) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
                {error.missingColumns.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold tracking-wide text-red-300 uppercase">
                      Missing columns
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {error.missingColumns.map((col) => (
                        <span
                          key={col}
                          className="rounded-md bg-red-900/60 px-2 py-0.5 font-mono text-[11px] text-red-100"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-tessolve-orange px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-tessolve-orange-dark"
                >
                  <Download size={16} />
                  Generate & Download Sample CSV
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          Demo data lives in <code className="text-slate-300">sample/sample_team_roster.csv</code>
        </p>
      </div>
    </div>
  )
}
