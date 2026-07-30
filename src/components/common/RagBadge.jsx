const STYLES = {
  GREEN: 'bg-rag-green/15 text-rag-green border-rag-green/30',
  AMBER: 'bg-rag-amber/15 text-rag-amber border-rag-amber/30',
  RED: 'bg-rag-red/15 text-rag-red border-rag-red/30',
}

export default function RagBadge({ status, small = false }) {
  const cls = STYLES[status] || STYLES.AMBER
  return (
    <span
      className={`inline-flex items-center rounded-md border font-semibold uppercase tracking-wide ${cls} ${
        small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      }`}
    >
      {status}
    </span>
  )
}
