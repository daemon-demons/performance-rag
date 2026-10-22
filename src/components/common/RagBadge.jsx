const STYLES = {
  GREEN: 'bg-green-50 text-status-ready border-green-200',
  AMBER: 'bg-amber-50 text-status-watch border-amber-200',
  RED: 'bg-red-50 text-status-risk border-red-200',
}

const LABELS = {
  GREEN: 'Ready',
  AMBER: 'Watch',
  RED: 'At risk',
}

export default function RagBadge({ status, onClick, human = false }) {
  const cls = STYLES[status] || STYLES.AMBER
  const label = human ? LABELS[status] || status : status
  const className = `hit inline-flex items-center rounded-md border px-3 font-medium ${cls} ${
    onClick ? 'cursor-pointer' : ''
  }`

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className} title={`Filter ${label}`}>
        {label}
      </button>
    )
  }

  return <span className={className}>{label}</span>
}
