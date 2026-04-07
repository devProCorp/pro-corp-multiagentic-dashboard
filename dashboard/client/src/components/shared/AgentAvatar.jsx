import { AGENT_COLORS } from '../../utils/constants'
import { agentDisplayName } from '../../utils/formatters'

export default function AgentAvatar({ slug, size = 'md' }) {
  const colors = AGENT_COLORS[slug] || { bg: 'bg-gray-500', ring: 'ring-gray-500/30' }
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const initials = agentDisplayName(slug).substring(0, 2).toUpperCase()

  return (
    <div className={`${sizes[size]} ${colors.bg} rounded-full flex items-center justify-center font-bold text-white ring-2 ${colors.ring}`}>
      {initials}
    </div>
  )
}
