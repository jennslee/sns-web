import { motion } from 'framer-motion'
import { BarChart2, Hash, PlayCircle, TrendingUp, Youtube, Instagram, Clock } from 'lucide-react'
import { useJobs, useResults, useKeywords } from '@/api/hooks'
import { fmtNum, fmtDate } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const STATUS_COLOR: Record<string, string> = {
  done: 'text-emerald-400', running: 'text-yellow-400', error: 'text-red-400', pending: 'text-gray-400',
}
const STATUS_LABEL: Record<string, string> = {
  done: '완료', running: '실행 중', error: '오류', pending: '대기',
}
const SENTIMENT_COLORS = ['#4ade80', '#94a3b8', '#f87171']

export default function Dashboard() {
  const { data: jobs    = [] } = useJobs()
  const { data: results = [] } = useResults()
  const { data: keywords = [] } = useKeywords()

  const totalPosts  = results.reduce((s: number, r: any) => s + (r.total_posts  ?? 0), 0)
  const totalLikes  = results.reduce((s: number, r: any) => s + (r.total_likes  ?? 0), 0)
  const totalViews  = results.reduce((s: number, r: any) => s + (r.total_views  ?? 0), 0)

  // 주간 분석 건수 (최근 7일)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    const count = jobs.filter((j: any) => new Date(j.created_at).toDateString() === d.toDateString()).length
    return { date: label, count }
  })

  // 감성 집계
  const sentimentAgg = { positive: 0, neutral: 0, negative: 0 }
  results.forEach((r: any) => {
    (r.sentiment ?? []).forEach((s: any) => {
      const key = s.sentiment as keyof typeof sentimentAgg
      if (key in sentimentAgg) sentimentAgg[key] += s.count ?? 0
    })
  })
  const pieData = [
    { name: '긍정', value: sentimentAgg.positive },
    { name: '중립', value: sentimentAgg.neutral },
    { name: '부정', value: sentimentAgg.negative },
  ].filter(d => d.value > 0)

  const cards = [
    { icon: Hash,       label: '등록 키워드',   value: keywords.length,   color: 'from-violet-500 to-purple-600' },
    { icon: PlayCircle, label: '총 분석 횟수',   value: jobs.length,       color: 'from-blue-500 to-cyan-600' },
    { icon: BarChart2,  label: '수집 게시물',   value: fmtNum(totalPosts), color: 'from-emerald-500 to-teal-600' },
    { icon: TrendingUp, label: '총 조회수',      value: fmtNum(totalViews), color: 'from-orange-500 to-amber-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass rounded-xl p-5 flex items-center gap-4"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xl font-bold text-white mt-0.5">{value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 주간 분석 추이 */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="glass rounded-xl p-5 xl:col-span-2"
        >
          <h2 className="text-sm font-semibold text-gray-300 mb-4">주간 분석 추이</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#grad)" strokeWidth={2} name="분석 건수" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* 감성 분포 */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="glass rounded-xl p-5"
        >
          <h2 className="text-sm font-semibold text-gray-300 mb-4">전체 감성 분포</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={SENTIMENT_COLORS[i]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-400">{v}</span>} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-600 text-sm">분석 결과 없음</div>
          )}
        </motion.div>
      </div>

      {/* 최근 분석 이력 */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300">최근 분석 이력</h2>
        </div>
        <div className="divide-y divide-gray-800/60">
          {jobs.slice(0, 8).map((job: any) => (
            <div key={job.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-800/30 transition">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                {job.platform === 'instagram' ? <Instagram size={14} className="text-pink-400" /> : <Youtube size={14} className="text-red-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">#{job.keyword}</p>
                <p className="text-xs text-gray-500">{fmtDate(job.created_at)}</p>
              </div>
              <span className={`text-xs font-medium ${STATUS_COLOR[job.status]}`}>
                {STATUS_LABEL[job.status]}
              </span>
              {job.status === 'running' && (
                <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 transition-all" style={{ width: `${job.progress}%` }} />
                </div>
              )}
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="py-10 text-center text-gray-600 text-sm">
              <Clock size={28} className="mx-auto mb-2 opacity-40" />분석 이력이 없습니다
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
