const STYLES = {
  GREEN: 'bg-green-50 text-rag-green border-green-200',
  AMBER: 'bg-amber-50 text-rag-amber border-amber-200',
  RED: 'bg-red-50 text-rag-red border-red-200',
}

export default function RagBadge({ status, small = false }) {
  const cls = STYLES[status] || STYLES.AMBER
  return (
    <span
      className={`inline-flex items-center rounded border tracking-wide uppercase ${cls} ${
        small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      }`}
    >
      {status}
    </span>
  )
}
