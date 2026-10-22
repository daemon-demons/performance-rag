import { useState } from 'react'
import { GripVertical, Minus, Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { RAG_LABELS } from '../../utils/csvSchema'
import { clientColor } from '../../utils/clientColors'
import { bandOf } from '../../utils/teamShape'

const RAIL = {
  GREEN: '#16A34A',
  AMBER: '#D97706',
  RED: '#DC2626',
}

const STATUS_TEXT = {
  GREEN: 'text-status-ready',
  AMBER: 'text-status-watch',
  RED: 'text-status-risk',
}

function tint(hex, amount = 0.18) {
  const h = String(hex || '').replace('#', '')
  if (h.length !== 6) return '#f1f5f9'
  const mix = (channel) =>
    Math.round(Number.parseInt(channel, 16) * amount + 255 * (1 - amount))
  return `rgb(${mix(h.slice(0, 2))}, ${mix(h.slice(2, 4))}, ${mix(h.slice(4, 6))})`
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
  const rail = node.isDeparted ? '#94a3b8' : RAIL[node.ragStatus] || '#cbd5e1'
  const band = bandOf(node.Role)
  const fill = node.isDeparted ? '#e2e8f0' : tint(clientColor(node.Client))
  const clientInk = node.isDeparted ? '#64748b' : clientColor(node.Client)

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
          className={`w-[9.5rem] cursor-pointer rounded-xl border border-hairline border-t-[3px] p-3 text-center shadow-[0_8px_24px_rgba(11,28,44,0.06)] ${
            dropOver ? 'ring-2 ring-tessolve-blue' : ''
          } ${dragging ? 'opacity-40' : ''}`}
          style={{ borderTopColor: rail, backgroundColor: fill }}
        >
          <p className="font-semibold break-words text-tessolve-navy">
            {node.Employee_Name}
          </p>
          <p className="mt-3 break-words">
            {band && (
              <span
                className={`font-semibold ${
                  band === 'senior' ? 'text-tessolve-navy' : 'text-tessolve-blue-dark'
                }`}
              >
                {band === 'senior' ? 'Senior' : 'Junior'}
              </span>
            )}
            {band ? ' · ' : ''}
            <span className="type-secondary">{node.Role}</span>
          </p>
          <p className="break-words font-medium" style={{ color: clientInk }}>
            {node.Client}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setFilters((f) => ({
                ...f,
                rag: f.rag === node.ragStatus ? 'All' : node.ragStatus,
              }))
            }}
            className={`hit mt-3 font-medium ${STATUS_TEXT[node.ragStatus] || 'text-slate-500'}`}
          >
            {RAG_LABELS[node.ragStatus] || node.ragStatus}
          </button>
          <div
            className="mt-1 flex items-center justify-between gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <span
              draggable
              role="button"
              tabIndex={0}
              title="Drag to reassign (or Edit → Reports to in the profile)"
              aria-label={`Drag to reassign ${node.Employee_Name}. For keyboard, open profile and change Reports to.`}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedEmployeeId(node.id)
                }
              }}
              className="inline-flex cursor-grab text-slate-400 active:cursor-grabbing"
            >
              <GripVertical size={14} />
            </span>
            <label className="flex cursor-pointer items-center gap-3 text-slate-500">
              <input
                type="checkbox"
                checked={Boolean(node.isDeparted)}
                onChange={() => toggleDeparted(node.id)}
                className="rounded border-slate-300"
              />
              Departed
            </label>
            {hasChildren ? (
              <button
                type="button"
                aria-label={expanded ? 'Collapse' : 'Expand'}
                onClick={() => setExpanded((v) => !v)}
                className="text-slate-400 hover:text-slate-700"
              >
                {expanded ? <Minus size={14} /> : <Plus size={14} />}
              </button>
            ) : (
              <span className="w-3.5" />
            )}
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
