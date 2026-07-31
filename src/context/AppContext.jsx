import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { evaluateTeam, applyHierarchyRag } from '../utils/ragEvaluator'
import { applyAttritionCascade } from '../utils/attritionCascade'
import { aggregateClientRisk } from '../utils/clientRisk'
import {
  buildOrgTree,
  collectSubtree,
  wouldCreateCycle,
} from '../utils/orgTree'
import { persistRoster as writeRosterCsv } from '../utils/csvPersist'

const AppContext = createContext(null)

function pipeline(raw) {
  if (!raw?.length) return []
  const scored = evaluateTeam(raw)
  const afterAttrition = applyAttritionCascade(scored, true)
  return applyHierarchyRag(afterAttrition)
}

export function AppProvider({ children }) {
  const [rawEmployees, setRawEmployees] = useState(null)
  const rawRef = useRef(null)
  const [fileHandle, setFileHandle] = useState(null)
  const fileHandleRef = useRef(null)
  const [persistStatus, setPersistStatus] = useState('')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
  const [reorgPreview, setReorgPreview] = useState(null)
  const [filters, setFilters] = useState({
    client: 'All',
    role: 'All',
    rag: 'All',
    person: 'All',
    allocation: 'All',
  })

  const syncRaw = useCallback((next) => {
    rawRef.current = next
    setRawEmployees(next)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      client: 'All',
      role: 'All',
      rag: 'All',
      person: 'All',
      allocation: 'All',
    })
  }, [])

  const loadEmployees = useCallback(
    (employees, options = {}) => {
      const next = employees.map((e) => ({ ...e, isDeparted: false }))
      syncRaw(next)
      const handle = options.fileHandle ?? null
      fileHandleRef.current = handle
      setFileHandle(handle)
      setPersistStatus('')
      setReorgPreview(null)
      setFilters({
        client: 'All',
        role: 'All',
        rag: 'All',
        person: 'All',
        allocation: 'All',
      })
      setSelectedEmployeeId(null)
    },
    [syncRaw],
  )

  const clearData = useCallback(() => {
    syncRaw(null)
    fileHandleRef.current = null
    setFileHandle(null)
    setPersistStatus('')
    setReorgPreview(null)
    setFilters({
      client: 'All',
      role: 'All',
      rag: 'All',
      person: 'All',
      allocation: 'All',
    })
    setSelectedEmployeeId(null)
  }, [syncRaw])

  const persistRoster = useCallback(async (overrideRaw) => {
    const people = overrideRaw ?? rawRef.current
    if (!people?.length) return null
    const result = await writeRosterCsv(people, fileHandleRef.current)
    const msg =
      result.method === 'file'
        ? 'CSV saved to linked file'
        : 'CSV downloaded (link a local file for auto-save)'
    setPersistStatus(msg)
    window.setTimeout(() => setPersistStatus(''), 3500)
    return result
  }, [])

  const toggleDeparted = useCallback((employeeId) => {
    const prev = rawRef.current
    if (!prev) return
    const next = prev.map((e) =>
      e.id === employeeId ? { ...e, isDeparted: !e.isDeparted } : e,
    )
    syncRaw(next)
  }, [syncRaw])

  const updateEmployee = useCallback(
    (employeeId, patch) => {
      const prev = rawRef.current
      if (!prev) return
      const next = prev.map((e) =>
        e.id === employeeId ? { ...e, ...patch } : e,
      )
      syncRaw(next)
    },
    [syncRaw],
  )

  /** Apply sidebar edits atomically, then persist CSV. */
  const commitEmployeeUpdate = useCallback(
    async (employeeId, patch) => {
      const prev = rawRef.current
      if (!prev) return null
      let next = prev.map((e) => {
        if (e.id !== employeeId) return e
        const merged = { ...e, ...patch }
        return merged
      })
      if (Object.prototype.hasOwnProperty.call(patch, 'Reports_To')) {
        const mgr = String(patch.Reports_To || '').trim()
        if (wouldCreateCycle(next, employeeId, mgr)) {
          next = prev.map((e) =>
            e.id === employeeId
              ? { ...e, ...patch, Reports_To: e.Reports_To }
              : e,
          )
        }
      }
      syncRaw(next)
      return persistRoster(next)
    },
    [syncRaw, persistRoster],
  )

  const reassignReport = useCallback(
    (employeeId, managerName) => {
      const prev = rawRef.current
      if (!prev) return
      const mgr = String(managerName || '').trim()
      if (wouldCreateCycle(prev, employeeId, mgr)) return
      const before = pipeline(prev)
      const next = prev.map((e) =>
        e.id === employeeId ? { ...e, Reports_To: mgr } : e,
      )
      const after = pipeline(next)
      const beforeById = new Map(before.map((e) => [e.id, e.ragStatus]))
      const deltas = after
        .filter((e) => beforeById.get(e.id) !== e.ragStatus)
        .map((e) => ({
          id: e.id,
          name: e.Employee_Name,
          from: beforeById.get(e.id),
          to: e.ragStatus,
        }))
      syncRaw(next)
      if (fileHandleRef.current) {
        void persistRoster(next)
      }
      if (deltas.length) {
        setReorgPreview({
          title: `Reassigned → ${mgr || 'root'}`,
          deltas,
          at: Date.now(),
        })
        window.setTimeout(() => setReorgPreview(null), 6000)
      }
      return deltas
    },
    [syncRaw, persistRoster],
  )

  /** Dry-run attrition for a set of names (does not mutate). */
  const previewAttrition = useCallback((departedNames) => {
    const prev = rawRef.current
    if (!prev) return { before: [], after: [], deltas: [] }
    const nameSet = new Set(
      (departedNames || []).map((n) => String(n).trim().toLowerCase()),
    )
    const hypothetical = prev.map((e) => ({
      ...e,
      isDeparted:
        e.isDeparted ||
        nameSet.has(String(e.Employee_Name).trim().toLowerCase()),
    }))
    const before = pipeline(prev)
    const after = pipeline(hypothetical)
    const beforeById = new Map(before.map((e) => [e.id, e.ragStatus]))
    const deltas = after
      .filter((e) => beforeById.get(e.id) !== e.ragStatus)
      .map((e) => ({
        id: e.id,
        name: e.Employee_Name,
        from: beforeById.get(e.id),
        to: e.ragStatus,
      }))
    return { before, after, deltas, hypothetical }
  }, [])

  const applyAttritionPreview = useCallback(
    async (departedNames) => {
      const { hypothetical } = previewAttrition(departedNames)
      if (!hypothetical) return
      syncRaw(hypothetical)
      await persistRoster(hypothetical)
    },
    [previewAttrition, syncRaw, persistRoster],
  )

  const evaluated = useMemo(
    () => pipeline(rawEmployees),
    [rawEmployees],
  )

  const filterOptions = useMemo(() => {
    const clients = [
      ...new Set(evaluated.map((e) => e.Client).filter(Boolean)),
    ].sort()
    const roles = [
      ...new Set(evaluated.map((e) => e.Role).filter(Boolean)),
    ].sort()
    const people = evaluated
      .map((e) => e.Employee_Name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
    return { clients, roles, people }
  }, [evaluated])

  const filteredEmployees = useMemo(() => {
    return evaluated.filter((e) => {
      if (filters.client !== 'All' && e.Client !== filters.client) return false
      if (filters.role !== 'All' && e.Role !== filters.role) return false
      if (filters.rag !== 'All' && e.ragStatus !== filters.rag) return false
      if (filters.allocation !== 'All') {
        const status = e.Allocation_Status || 'Project'
        if (status !== filters.allocation) return false
      }
      return true
    })
  }, [evaluated, filters])

  const clientRisk = useMemo(
    () => aggregateClientRisk(filteredEmployees),
    [filteredEmployees],
  )

  const orgEmployees = useMemo(() => {
    if (filters.person && filters.person !== 'All') {
      return collectSubtree(evaluated, filters.person)
    }
    return filteredEmployees
  }, [evaluated, filteredEmployees, filters.person])

  const selectedEmployee = useMemo(() => {
    if (!selectedEmployeeId) return null
    return evaluated.find((e) => e.id === selectedEmployeeId) || null
  }, [evaluated, selectedEmployeeId])

  const kpis = useMemo(() => {
    const pool = filteredEmployees
    const total = pool.length
    const green = pool.filter(
      (e) => !e.isDeparted && e.ragStatus === 'GREEN',
    ).length
    const amber = pool.filter(
      (e) => !e.isDeparted && e.ragStatus === 'AMBER',
    ).length
    const red = pool.filter(
      (e) => !e.isDeparted && e.ragStatus === 'RED',
    ).length
    const departed = pool.filter((e) => e.isDeparted).length
    const project = pool.filter(
      (e) => !e.isDeparted && (e.Allocation_Status || 'Project') === 'Project',
    ).length
    const bench = pool.filter(
      (e) => !e.isDeparted && e.Allocation_Status === 'Bench',
    ).length
    return { total, green, amber, red, departed, project, bench }
  }, [filteredEmployees])

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (filters.client !== 'All') n += 1
    if (filters.role !== 'All') n += 1
    if (filters.rag !== 'All') n += 1
    if (filters.allocation !== 'All') n += 1
    if (filters.person && filters.person !== 'All') n += 1
    return n
  }, [filters])

  const selectEmployeeByName = useCallback(
    (name) => {
      const hit = evaluated.find(
        (e) =>
          String(e.Employee_Name).trim().toLowerCase() ===
          String(name || '')
            .trim()
            .toLowerCase(),
      )
      if (hit) setSelectedEmployeeId(hit.id)
    },
    [evaluated],
  )

  const value = {
    hasData: Boolean(rawEmployees?.length),
    rawEmployees,
    employees: evaluated,
    filteredEmployees,
    orgEmployees,
    filters,
    setFilters,
    clearFilters,
    activeFilterCount,
    filterOptions,
    loadEmployees,
    clearData,
    toggleDeparted,
    updateEmployee,
    commitEmployeeUpdate,
    reassignReport,
    previewAttrition,
    applyAttritionPreview,
    persistRoster,
    persistStatus,
    fileHandle,
    hasLinkedFile: Boolean(fileHandle),
    reorgPreview,
    setReorgPreview,
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectEmployeeByName,
    selectedEmployee,
    kpis,
    clientRisk,
    buildOrgTree,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
