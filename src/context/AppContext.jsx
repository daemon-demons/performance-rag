import {
  createContext,
  useCallback,
  useContext,
  useMemo,
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

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [rawEmployees, setRawEmployees] = useState(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
  const [filters, setFilters] = useState({
    client: 'All',
    role: 'All',
    rag: 'All',
    person: 'All',
  })

  const loadEmployees = useCallback((employees) => {
    setRawEmployees(employees.map((e) => ({ ...e, isDeparted: false })))
    setFilters({ client: 'All', role: 'All', rag: 'All', person: 'All' })
    setSelectedEmployeeId(null)
  }, [])

  const clearData = useCallback(() => {
    setRawEmployees(null)
    setFilters({ client: 'All', role: 'All', rag: 'All', person: 'All' })
    setSelectedEmployeeId(null)
  }, [])

  const toggleDeparted = useCallback((employeeId) => {
    setRawEmployees((prev) => {
      if (!prev) return prev
      return prev.map((e) =>
        e.id === employeeId ? { ...e, isDeparted: !e.isDeparted } : e,
      )
    })
  }, [])

  const updateEmployee = useCallback((employeeId, patch) => {
    setRawEmployees((prev) => {
      if (!prev) return prev
      return prev.map((e) => (e.id === employeeId ? { ...e, ...patch } : e))
    })
  }, [])

  const reassignReport = useCallback((employeeId, managerName) => {
    setRawEmployees((prev) => {
      if (!prev) return prev
      const mgr = String(managerName || '').trim()
      if (wouldCreateCycle(prev, employeeId, mgr)) return prev
      return prev.map((e) =>
        e.id === employeeId ? { ...e, Reports_To: mgr } : e,
      )
    })
  }, [])

  const evaluated = useMemo(() => {
    if (!rawEmployees) return []
    const scored = evaluateTeam(rawEmployees)
    const afterAttrition = applyAttritionCascade(scored, true)
    return applyHierarchyRag(afterAttrition)
  }, [rawEmployees])

  const clientRisk = useMemo(
    () => aggregateClientRisk(evaluated),
    [evaluated],
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
      return true
    })
  }, [evaluated, filters])

  /** Org view: person filter expands to self + descendants (ignores other filters). */
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
    const total = evaluated.length
    const green = evaluated.filter(
      (e) => !e.isDeparted && e.ragStatus === 'GREEN',
    ).length
    const amber = evaluated.filter(
      (e) => !e.isDeparted && e.ragStatus === 'AMBER',
    ).length
    const red = evaluated.filter(
      (e) => !e.isDeparted && e.ragStatus === 'RED',
    ).length
    const departed = evaluated.filter((e) => e.isDeparted).length
    return { total, green, amber, red, departed }
  }, [evaluated])

  const value = {
    hasData: Boolean(rawEmployees?.length),
    employees: evaluated,
    filteredEmployees,
    orgEmployees,
    filters,
    setFilters,
    filterOptions,
    loadEmployees,
    clearData,
    toggleDeparted,
    updateEmployee,
    reassignReport,
    selectedEmployeeId,
    setSelectedEmployeeId,
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
