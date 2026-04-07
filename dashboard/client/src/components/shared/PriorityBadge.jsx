import { PRIORITIES } from '../../utils/constants'

export default function PriorityBadge({ priority }) {
  const config = PRIORITIES[priority] || PRIORITIES.MEDIUM
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}
