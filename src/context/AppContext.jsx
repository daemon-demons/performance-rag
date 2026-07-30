import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { evaluateTeam } from '../utils/ragEvaluator'
import { applyAttritionCascade } from '../utils/attritionCascade'
import { aggregateClientRisk } from '../utils/clientRisk'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [rawEmployees, setRawEmployees] = useState(null)
  const [attritionMode, setAttritionMode] = useState(false)
  const [filters, setFilters] = useState({
    client: 'All',
    role: 'All',
    rag: 'All',
  })

  const loadEmployees = useCallback((employees) => {
    setRawEmployees(employees.map((e) => ({ ...e, isDeparted: false })))
    setFilters({ client: 'All', role: 'All', rag: 'All' })
    setAttritionMode(false)
  }, [])

  const clearData = useCallback(() => {
    setRawEmployees(null)
    setAttritionMode(false)
    setFilters({ client: 'All', role: 'All', rag: 'All' })
  }, [])

  const toggleDeparted = useCallback((employeeId) => {
    setRawEmployees((prev) => {
      if (!prev) return prev
      return prev.map((e) =>
        e.id === employeeId ? { ...e, isDeparted: !e.isDeparted } : e,
      )
    })
  }, [])

  const evaluated = useMemo(() => {
    if (!rawEmployees) return []
    const scored = evaluateTeam(rawEmployees)
    return applyAttritionCascade(scored, attritionMode)
  }, [rawEmployees, attritionMode])

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
    return { clients, roles }
  }, [evaluated])

  const filteredEmployees = useMemo(() => {
    return evaluated.filter((e) => {
      if (filters.client !== 'All' && e.Client !== filters.client) return false
      if (filters.role !== 'All' && e.Role !== filters.role) return false
      if (filters.rag !== 'All' && e.ragStatus !== filters.rag) return false
      return true
    })
  }, [evaluated, filters])

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
    filters,
    setFilters,
    filterOptions,
    attritionMode,
    setAttritionMode,
    loadEmployees,
    clearData,
    toggleDeparted,
    kpis,
    clientRisk,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
