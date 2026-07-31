import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Download, Play, FolderOpen } from 'lucide-react'
import DropzoneUpload from './DropzoneUpload'
import {
  validateAndParseCsv,
  validateAndParseCsvText,
} from '../../utils/csvValidator'
import { downloadSampleCsv } from '../../utils/sampleCsv'
import {
  openCsvWithHandle,
  supportsFileSystemAccess,
} from '../../utils/csvPersist'
import { useApp } from '../../context/AppContext'

const DEMO_SAMPLE_URL = `${import.meta.env.BASE_URL}sample/sample_team_roster.csv`

export default function WelcomeScreen() {
  const { loadEmployees } = useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const applyParseResult = (result, options = {}) => {
    if (!result.ok) {
      setError({
        messages: result.errors,
        missingColumns: result.missingColumns || [],
      })
      return false
    }
    loadEmployees(result.employees, options)
    navigate('/dashboard')
    return true
  }

  const handleFile = async (file, fileHandle = null) => {
    setLoading(true)
    setError(null)
    try {
      applyParseResult(await validateAndParseCsv(file), { fileHandle })
    } catch (err) {
      setError({
        messages: [err?.message || 'Unexpected error while parsing CSV.'],
        missingColumns: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenLocal = async () => {
    setLoading(true)
    setError(null)
    try {
      const { file, handle } = await openCsvWithHandle()
      applyParseResult(await validateAndParseCsv(file), { fileHandle: handle })
    } catch (err) {
      if (err?.name === 'AbortError') return
      setError({
        messages: [
          err?.message ||
            'Could not open local CSV. Try drag-and-drop instead.',
        ],
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
        throw new Error(`Could not load demo sample (${response.status}).`)
      }
      applyParseResult(validateAndParseCsvText(await response.text()))
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
            'radial-gradient(ellipse 80% 60% at 10% 20%, rgba(242,128,43,0.22), transparent), radial-gradient(ellipse 70% 50% at 90% 10%, rgba(35,166,227,0.25), transparent), linear-gradient(160deg, #0b1c2c 0%, #12263a 45%, #1a3348 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-12 sm:px-6">
        <div className="mb-8 flex animate-fade-up items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-tessolve-orange to-tessolve-blue shadow-lg shadow-tessolve-orange/30 ring-2 ring-white/10">
            <span className="font-display text-xs font-bold tracking-wider text-white">
              RAG
            </span>
          </div>
          <div>
            <p className="font-display text-sm font-semibold tracking-wide text-tessolve-orange uppercase">
              Tessolve
            </p>
            <p className="text-xs text-slate-300">
              Silicon & Systems · Test Engineering · Performance RAG
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
          Three steps: load your team CSV, review the Dashboard for readiness
          and billing, then click a person to act — all on this device.
        </p>

        <ol className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
          <li className="rounded-full border border-white/20 bg-white/5 px-3 py-1">
            1. Load CSV
          </li>
          <li className="rounded-full border border-white/20 bg-white/5 px-3 py-1">
            2. Review Dashboard
          </li>
          <li className="rounded-full border border-white/20 bg-white/5 px-3 py-1">
            3. Click a person to act
          </li>
        </ol>

        <div className="mt-10">
          <DropzoneUpload onFile={(f) => handleFile(f)} disabled={loading} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {supportsFileSystemAccess() && (
            <button
              type="button"
              onClick={handleOpenLocal}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-tessolve-blue/50 bg-tessolve-blue/20 px-4 py-2.5 text-sm font-semibold text-sky-100 shadow transition hover:bg-tessolve-blue/30 disabled:opacity-60"
            >
              <FolderOpen size={16} />
              Open & link local CSV
            </button>
          )}
          <button
            type="button"
            onClick={handleLoadDemo}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-tessolve-orange px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-tessolve-orange/25 transition hover:bg-tessolve-orange-dark active:scale-[0.98] disabled:opacity-60"
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
          <p className="mt-4 text-sm text-sky-200">
            Validating and evaluating roster…
          </p>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/40 bg-red-950/40 p-5 backdrop-blur">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 shrink-0 text-red-400" size={20} />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-base font-semibold text-red-200">
                  CSV validation failed
                </h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-100/90">
                  {error.messages.map((msg) => (
                    <li key={msg}>{msg}</li>
                  ))}
                </ul>
                {error.missingColumns.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {error.missingColumns.map((col) => (
                      <span
                        key={col}
                        className="rounded-md bg-red-900/60 px-2 py-0.5 font-mono text-[11px] text-red-100"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-tessolve-orange px-4 py-2.5 text-sm font-semibold text-white hover:bg-tessolve-orange-dark"
                >
                  <Download size={15} />
                  Generate & Download Sample CSV
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="mt-8 text-xs text-slate-400">
          Demo data:{' '}
          <code className="text-slate-300">sample/sample_team_roster.csv</code>
          {supportsFileSystemAccess() && (
            <> · Link a local file to auto-save edits</>
          )}
        </p>
      </div>
    </div>
  )
}
