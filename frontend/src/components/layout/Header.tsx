import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Search, Zap } from 'lucide-react'
import { useState } from 'react'

const BREADCRUMB: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: '대시보드',    sub: 'Overview' },
  '/keywords':  { title: '키워드 관리', sub: 'Keywords' },
  '/analysis':  { title: '분석 실행',   sub: 'Analysis' },
  '/results':   { title: '결과 보기',   sub: 'Results'  },
  '/settings':  { title: '설정',        sub: 'Settings' },
}

export default function Header() {
  const { pathname } = useLocation()
  const page = BREADCRUMB[pathname] ?? { title: 'SNS Analyzer', sub: '' }
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="h-14 flex items-center justify-between px-6 flex-shrink-0"
      style={{
        background: 'rgba(7,7,15,.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,.05)',
      }}
    >
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
          <Zap size={11} className="text-brand-400" />
          <span>SNS Analyzer</span>
          <span>/</span>
        </div>
        <motion.h1
          key={pathname}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold text-white"
        >
          {page.title}
        </motion.h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <motion.div className="relative flex items-center" layout>
          {searchOpen ? (
            <motion.input
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 180, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              autoFocus
              onBlur={() => setSearchOpen(false)}
              placeholder="검색..."
              className="input text-xs h-8 pl-8 pr-3"
              style={{ width: 180 }}
            />
          ) : null}
          <button
            onClick={() => setSearchOpen(v => !v)}
            className="btn-ghost p-2 rounded-lg"
            style={{ position: searchOpen ? 'absolute' : 'relative', left: searchOpen ? 8 : 0 }}
          >
            <Search size={15} />
          </button>
        </motion.div>

        {/* Notifications */}
        <button className="btn-ghost p-2 rounded-lg relative">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse-dot" />
        </button>

        {/* Avatar */}
        <div className="ml-1 w-7 h-7 rounded-lg gradient-brand flex items-center justify-center text-white text-[11px] font-bold cursor-pointer glow-brand-sm"
          data-tooltip="내 계정">
          S
        </div>
      </div>
    </header>
  )
}
