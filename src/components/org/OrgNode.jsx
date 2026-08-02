import { useState } from 'react'
import { GripVertical, Minus, Plus } from 'lucide-react'
import RagBadge from '../common/RagBadge'
import { useApp } from '../../context/AppContext'
import { clientColor } from '../../utils/clientColors'
import { normalizeRole } from '../../utils/ragEvaluator'

const HEADER_BY_TIER = {
  Manager: 'bg-tessolve-navy',
  Lead: 'bg-tessolve-blue',
  'Sr Eng 2': 'bg-[#1A8BC0]',
  'Sr Eng 1': 'bg-[#4db3e0]',
  'Eng 2': 'bg-tessolve-orange',
  'Eng 1': 'bg-[#f5a05a]',
  Intern: 'bg-slate-500',
}

function headerClass(role) {
  const n = normalizeRole(role)
  return HEADER_BY_TIER[n] || 'bg-slate-500'
}

export default function OrgNode({ node }) {
  const {
    toggleDeparted,
    reassignReport,
    setSelectedEmployeeId,
    setFilters,
  } = useApp()
  const [expanded, setExpanded] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [dropOver, setDropOver] = useState(false)
  const hasChildren = node.children?.length > 0

  const onDragStart = (e) => {
    e.dataTransfer.setData('text/employee-id', node.id)
    e.dataTransfer.effectAllowed = 'move'
    setDragging(true)
  }

  const onDragEnd = () => setDragging(false)

  const onDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropOver(true)
  }

  const onDragLeave = () => setDropOver(false)

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDropOver(false)
    const dragId = e.dataTransfer.getData('text/employee-id')
    if (!dragId || dragId === node.id) return
    reassignReport(dragId, node.Employee_Name)
  }

  return (
    <li className="org-branch">
      <div className="org-card-wrap">
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => setSelectedEmployeeId(node.id)}
          className={`relative w-36 cursor-pointer overflow-hidden rounded-xl border bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:w-40 ${
            dropOver
              ? 'border-tessolve-blue ring-2 ring-tessolve-blue/40'
              : 'border-slate-200/90'
          } ${dragging ? 'opacity-40' : ''} ${node.isDeparted ? 'opacity-50' : ''}`}
          style={{ borderLeftWidth: 3, borderLeftColor: clientColor(node.Client) }}
        >
          <div
            className={`flex items-center justify-between gap-1 px-1.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase ${headerClass(node.Role)}`}
          >
            <span
              draggable
              role="button"
              tabIndex={0}
              title="Drag to reassign (or Edit → Reports to in the profile)"
              aria-label={`Drag to reassign ${node.Employee_Name}. For keyboard, open profile and change Reports to.`}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                  setSelectedEmployeeId(node.id)
                }
              }}
              className="inline-flex cursor-grab items-center rounded bg-white/15 p-0.5 active:cursor-grabbing"
            >
              <GripVertical size={12} />
            </span>
            <span className="min-w-0 flex-1 truncate">{node.Role}</span>
            {hasChildren && (
              <button
                type="button"
                aria-label={expanded ? 'Collapse' : 'Expand'}
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded((v) => !v)
                }}
                className="shrink-0 rounded-full bg-white/25 p-0.5 hover:bg-white/40"
              >
                {expanded ? <Minus size={11} /> : <Plus size={11} />}
              </button>
            )}
          </div>
          <div className="space-y-1 px-2 py-2 text-center">
            <p className="font-display truncate text-sm font-semibold text-slate-900">
              {node.Employee_Name}
            </p>
            <div
              className="flex flex-wrap items-center justify-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <RagBadge
                status={node.ragStatus}
                small
                human
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    rag: f.rag === node.ragStatus ? 'All' : node.ragStatus,
                  }))
                }
              />
            </div>
            <p
              className="truncate text-[10px] font-medium"
              style={{ color: clientColor(node.Client) }}
            >
              {node.Client}
            </p>
            <label
              className="flex cursor-pointer items-center justify-center gap-1 text-[10px] text-slate-500"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={Boolean(node.isDeparted)}
                onChange={() => toggleDeparted(node.id)}
                className="rounded border-slate-300"
              />
              Departed
            </label>
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <ul className="org-kids">
          {node.children.map((child) => (
            <OrgNode key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  )
}
