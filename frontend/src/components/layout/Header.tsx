import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'

const titles: Record<string, string> = {
  '/dashboard': '대시보드',
  '/keywords':  '키워드 관리',
  '/analysis':  '분석 실행',
  '/results':   '결과 보기',
  '/settings':  '설정',
}

export default function Header() {
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'SNS Analyzer'

  return (
    <header className="h-14 border-b border-gray-800 bg-gray-900/50 backdrop-blur flex items-center justify-between px-6">
      <h1 className="text-base font-semibold text-white">{title}</h1>
      <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition">
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse-dot" />
      </button>
    </header>
  )
}
