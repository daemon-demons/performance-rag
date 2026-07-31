const STYLES = {
  GREEN: 'bg-green-50 text-rag-green border-green-200',
  AMBER: 'bg-amber-50 text-rag-amber border-amber-200',
  RED: 'bg-red-50 text-rag-red border-red-200',
}

const LABELS = {
  GREEN: 'Ready',
  AMBER: 'Watch',
  RED: 'At risk',
}

export default function RagBadge({
  status,
  small = false,
  onClick,
  human = false,
}) {
  const cls = STYLES[status] || STYLES.AMBER
  const label = human ? LABELS[status] || status : status
  const className = `inline-flex items-center rounded border tracking-wide ${
    human ? '' : 'uppercase'
  } ${cls} ${small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'} ${
    onClick
      ? 'cursor-pointer transition hover:ring-1 hover:ring-tessolve-orange/50'
      : ''
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
