import { TASK_STATUSES } from '../../utils/constants'

export default function StatusBadge({ status }) {
  const config = TASK_STATUSES[status] || TASK_STATUSES.PENDING
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
      {config.label}
    </span>
  )
}
