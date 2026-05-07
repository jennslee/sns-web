import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Hash, PlayCircle, BarChart2, Settings, Zap, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: '대시보드',  section: 'main' },
  { to: '/keywords',  icon: Hash,            label: '키워드',    section: 'main' },
  { to: '/analysis',  icon: PlayCircle,       label: '분석 실행', section: 'main' },
  { to: '/results',   icon: BarChart2,        label: '결과 보기', section: 'main' },
  { to: '/settings',  icon: Settings,         label: '설정',      section: 'system' },
]

const mainNav    = nav.filter(n => n.section === 'main')
const systemNav  = nav.filter(n => n.section === 'system')

export default function Sidebar() {
  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col border-r"
      style={{
        background: 'rgba(7,7,15,.85)',
        backdropFilter: 'blur(24px)',
        borderColor: 'rgba(255,255,255,.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center glow-brand-sm">
            <Zap size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-surface-0 animate-pulse-dot" />
        </div>
        <div>
          <p className="font-bold text-sm text-white tracking-tight leading-none">SNS Analyzer</p>
          <p className="text-[10px] text-gray-600 mt-1 tracking-wide">Intelligence Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5">
        <p className="section-title px-3 mb-2">메뉴</p>
        {mainNav.map(({ to, icon: Icon, label }, i) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                className={cn('nav-item', isActive ? 'nav-item-active' : 'nav-item-inactive')}
                whileHover={{ x: isActive ? 0 : 2 }}
                transition={{ duration: .15 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, rgba(99,102,241,.2) 0%, rgba(139,92,246,.1) 100%)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon size={16} className={cn('relative z-10 flex-shrink-0', isActive ? 'text-brand-400' : 'text-gray-600')} />
                <span className="relative z-10">{label}</span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400 relative z-10"
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}

        <div className="flex-1" />

        <div className="divider" />
        <p className="section-title px-3 mb-2">시스템</p>
        {systemNav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <div className={cn('nav-item', isActive ? 'nav-item-active' : 'nav-item-inactive')}>
                <Icon size={16} className={cn('flex-shrink-0', isActive ? 'text-brand-400' : 'text-gray-600')} />
                <span>{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,.05)' }}>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,.03)' }}>
          <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
            <Activity size={12} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-gray-300 truncate">시스템 정상</p>
            <p className="text-[10px] text-gray-600">v1.0.0 · Free</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
        </div>
      </div>
    </aside>
  )
}
