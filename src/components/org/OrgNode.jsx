import RagBadge from '../common/RagBadge'

const RAG_BORDER = {
  GREEN: 'border-l-rag-green',
  AMBER: 'border-l-rag-amber',
  RED: 'border-l-rag-red',
}

export default function OrgNode({ node, depth = 0 }) {
  const border = RAG_BORDER[node.ragStatus] || RAG_BORDER.AMBER

  return (
    <li className="relative">
      <div
        className={`mb-2 rounded-lg border border-slate-200 border-l-4 bg-white px-3 py-2 shadow-sm ${border} ${
          node.isDeparted ? 'opacity-55' : ''
        }`}
        style={{ marginLeft: depth * 16 }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-slate-900">{node.Employee_Name}</span>
          <RagBadge status={node.ragStatus} small />
          {node.isDeparted && (
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase">
              Departed
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {node.Role} · {node.Client}
          {node.attritionDowngraded ? ' · attrition cascade' : ''}
        </p>
      </div>

      {node.children?.length > 0 && (
        <ul className="ml-4 border-l border-slate-200 pl-2">
          {node.children.map((child) => (
            <OrgNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}
