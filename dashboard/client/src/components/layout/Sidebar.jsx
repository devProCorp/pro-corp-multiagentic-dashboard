import { NavLink } from 'react-router-dom'
import {
  HomeIcon,
  RocketLaunchIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

const links = [
  { to: '/', icon: HomeIcon, label: 'Dashboard' },
  { to: '/campaigns', icon: RocketLaunchIcon, label: 'Campanas' },
  { to: '/tasks', icon: ClipboardDocumentListIcon, label: 'Tareas' },
  { to: '/agents', icon: UserGroupIcon, label: 'Agentes' },
  { to: '/orchestration', icon: ChatBubbleLeftRightIcon, label: 'Orquestacion' },
]

export default function Sidebar() {
  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-5 border-b border-gray-800">
        <h1 className="text-lg font-bold text-white tracking-tight">PROCORP</h1>
        <p className="text-xs text-gray-500 mt-0.5">Agencia de Marketing IA</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-gray-500">Sistema activo</span>
        </div>
      </div>
    </aside>
  )
}
