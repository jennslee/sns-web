import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Hash, PlayCircle, BarChart2, Settings, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { to: '/keywords',  icon: Hash,            label: '키워드'   },
  { to: '/analysis',  icon: PlayCircle,       label: '분석 실행' },
  { to: '/results',   icon: BarChart2,        label: '결과 보기' },
  { to: '/settings',  icon: Settings,         label: '설정'     },
]

export default function Sidebar() {
  return (
    <aside className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
        <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-white leading-none">SNS Analyzer</p>
          <p className="text-[10px] text-gray-500 mt-0.5">v1.0.0</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-600">© 2026 SNS Analyzer</p>
      </div>
    </aside>
  )
}
