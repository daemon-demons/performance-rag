import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import RagBadge from '../common/RagBadge'
import { useApp } from '../../context/AppContext'
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
  const { toggleDeparted, reassignReport, setSelectedEmployeeId } = useApp()
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
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative w-[9.5rem] cursor-grab overflow-hidden rounded-xl border bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:cursor-grabbing sm:w-40 ${
            dropOver
              ? 'border-tessolve-blue ring-2 ring-tessolve-blue/40'
              : 'border-slate-200/90'
          } ${dragging ? 'opacity-40' : ''} ${node.isDeparted ? 'opacity-50' : ''}`}
        >
          <div
            className={`flex items-center justify-between gap-1 px-2 py-1.5 text-[10px] font-semibold tracking-wide text-white uppercase ${headerClass(node.Role)}`}
          >
            <span className="truncate">{node.Role}</span>
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
          <div className="space-y-1.5 px-2.5 py-2.5 text-center">
            <button
              type="button"
              onClick={() => setSelectedEmployeeId(node.id)}
              className="font-display w-full truncate text-sm font-semibold text-slate-900 hover:text-tessolve-blue hover:underline"
            >
              {node.Employee_Name}
            </button>
            <div className="flex flex-wrap items-center justify-center gap-1">
              <RagBadge status={node.ragStatus} small />
            </div>
            <p className="truncate text-[10px] text-slate-400">{node.Client}</p>
            <label
              className="flex cursor-pointer items-center justify-center gap-1.5 text-[10px] text-slate-500"
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
