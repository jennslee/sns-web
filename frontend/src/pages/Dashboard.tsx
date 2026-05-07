import { motion } from 'framer-motion'
import { BarChart2, Hash, PlayCircle, TrendingUp, Youtube, Instagram, Clock, ArrowUpRight, Zap } from 'lucide-react'
import { useJobs, useResults, useKeywords } from '@/api/hooks'
import { fmtNum, fmtDate } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const STATUS_CONFIG: Record<string, { color: string; cls: string; dot: string }> = {
  done:    { color: '#10b981', cls: 'badge-emerald', dot: 'bg-emerald-400' },
  running: { color: '#f59e0b', cls: 'badge-yellow',  dot: 'bg-yellow-400 animate-pulse' },
  error:   { color: '#ef4444', cls: 'badge-red',     dot: 'bg-red-400' },
  pending: { color: '#6b7280', cls: 'badge-gray',    dot: 'bg-gray-500' },
}
const STATUS_LABEL: Record<string, string> = {
  done: '완료', running: '실행 중', error: '오류', pending: '대기',
}
const SENTIMENT_COLORS = ['#10b981', '#6366f1', '#ef4444']

const CHART_TOOLTIP_STYLE = {
  background: 'rgba(13,15,26,.95)',
  border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 10,
  boxShadow: '0 8px 32px rgba(0,0,0,.4)',
  fontSize: 12,
  color: '#e5e7eb',
}

function stagger(i: number) { return { delay: i * 0.06 } }

export default function Dashboard() {
  const { data: jobs     = [] } = useJobs()
  const { data: results  = [] } = useResults()
  const { data: keywords = [] } = useKeywords()

  const totalPosts    = results.reduce((s: number, r: any) => s + (r.total_posts    ?? 0), 0)
  const totalViews    = results.reduce((s: number, r: any) => s + (r.total_views    ?? 0), 0)
  const totalLikes    = results.reduce((s: number, r: any) => s + (r.total_likes    ?? 0), 0)
  const runningJobs   = jobs.filter((j: any) => j.status === 'running').length

  // Weekly analysis trend
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    const count = jobs.filter((j: any) =>
      new Date(j.created_at).toDateString() === d.toDateString()
    ).length
    return { date: label, count }
  })

  // Sentiment aggregate
  const sentimentAgg = { positive: 0, neutral: 0, negative: 0 }
  results.forEach((r: any) => {
    ;(r.sentiment ?? []).forEach((s: any) => {
      const key = s.sentiment as keyof typeof sentimentAgg
      if (key in sentimentAgg) sentimentAgg[key] += s.count ?? 0
    })
  })
  const pieData = [
    { name: '긍정', value: sentimentAgg.positive },
    { name: '중립', value: sentimentAgg.neutral  },
    { name: '부정', value: sentimentAgg.negative },
  ].filter(d => d.value > 0)

  const cards = [
    { icon: Hash,       label: '등록 키워드',  value: keywords.length,    sub: 'Keywords',  color: 'from-violet-500 to-purple-700',  glow: 'rgba(139,92,246,.35)' },
    { icon: PlayCircle, label: '총 분석 횟수',  value: jobs.length,        sub: 'Jobs run',  color: 'from-blue-500 to-cyan-600',      glow: 'rgba(6,182,212,.3)' },
    { icon: BarChart2,  label: '수집 게시물',  value: fmtNum(totalPosts),  sub: 'Posts',     color: 'from-emerald-500 to-teal-600',   glow: 'rgba(16,185,129,.3)' },
    { icon: TrendingUp, label: '총 조회수',     value: fmtNum(totalViews),  sub: 'Views',     color: 'from-orange-500 to-amber-600',   glow: 'rgba(245,158,11,.3)' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Live indicator */}
      {runningJobs > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm"
          style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)' }}
        >
          <Zap size={14} className="text-yellow-400 flex-shrink-0" />
          <span className="text-yellow-300 font-medium">{runningJobs}개 분석 진행 중</span>
          <span className="text-yellow-600 text-xs">· 결과가 자동으로 업데이트됩니다</span>
          <div className="ml-auto flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-1 h-4 rounded-full bg-yellow-500 animate-pulse"
                style={{ animationDelay: `${i * .2}s`, opacity: .4 + i * .2 }} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, label, value, sub, color, glow }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...stagger(i), type: 'spring', stiffness: 260, damping: 24 }}
            className="stat-card"
          >
            <div
              className={`icon-badge bg-gradient-to-br ${color}`}
              style={{ boxShadow: `0 4px 16px ${glow}` }}
            >
              <Icon size={18} className="text-white" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium tracking-wide">{label}</p>
              <p className="text-2xl font-bold text-white mt-0.5 leading-none tracking-tight">{value}</p>
              <p className="text-[10px] text-gray-600 mt-1 uppercase tracking-wider">{sub}</p>
            </div>
            <ArrowUpRight size={14} className="ml-auto text-gray-700 flex-shrink-0 self-start" />
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Weekly trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 }}
          className="glass rounded-2xl p-5 xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-white">주간 분석 추이</h2>
              <p className="text-xs text-gray-600 mt-0.5">최근 7일 분석 건수</p>
            </div>
            <span className="badge badge-purple text-[10px]">7 DAYS</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={weeklyData} margin={{ left: -20, right: 8 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#6366f1" stopOpacity={.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ stroke: 'rgba(99,102,241,.3)', strokeWidth: 1 }} />
              <Area
                type="monotone" dataKey="count" name="분석 건수"
                stroke="#6366f1" strokeWidth={2}
                fill="url(#areaGrad)"
                dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }}
                activeDot={{ fill: '#818cf8', stroke: 'rgba(99,102,241,.4)', strokeWidth: 4, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sentiment donut */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .32 }}
          className="glass rounded-2xl p-5"
        >
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white">감성 분포</h2>
            <p className="text-xs text-gray-600 mt-0.5">전체 수집 게시물 기준</p>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="50%"
                    innerRadius={48} outerRadius={72}
                    paddingAngle={3} dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={SENTIMENT_COLORS[i]}
                        style={{ filter: `drop-shadow(0 0 6px ${SENTIMENT_COLORS[i]}60)` }}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-1">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: SENTIMENT_COLORS[i] }} />
                    <span className="text-xs text-gray-400">{d.name}</span>
                    <span className="text-xs font-semibold text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[190px] flex flex-col items-center justify-center text-gray-700 text-sm">
              <BarChart2 size={28} className="mb-2 opacity-30" />
              <p>분석 결과 없음</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent jobs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          <div>
            <h2 className="text-sm font-semibold text-white">최근 분석 이력</h2>
            <p className="text-xs text-gray-600 mt-0.5">최근 8건</p>
          </div>
          {jobs.length > 0 && (
            <span className="badge badge-gray">{jobs.length} total</span>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="py-14 text-center">
            <Clock size={30} className="mx-auto text-gray-700 mb-3" />
            <p className="text-sm text-gray-600">아직 분석 이력이 없습니다</p>
            <p className="text-xs text-gray-700 mt-1">키워드를 추가하고 첫 분석을 실행해보세요</p>
          </div>
        ) : (
          <div>
            {jobs.slice(0, 8).map((job: any, i: number) => {
              const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.pending
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: .45 + i * .04 }}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors duration-150"
                  style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  {/* Platform icon */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: job.platform === 'instagram' ? 'rgba(236,72,153,.1)' : 'rgba(239,68,68,.1)' }}>
                    {job.platform === 'instagram'
                      ? <Instagram size={14} className="text-pink-400" />
                      : <Youtube size={14} className="text-red-400" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      <span className="text-gray-500 mr-0.5">#</span>{job.keyword}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">{fmtDate(job.created_at)}</p>
                  </div>

                  {/* Progress bar for running */}
                  {job.status === 'running' && (
                    <div className="w-20 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                        animate={{ width: `${job.progress ?? 0}%` }}
                        transition={{ ease: 'linear', duration: .5 }}
                      />
                    </div>
                  )}

                  {/* Status badge */}
                  <div className={`badge ${cfg.cls} flex-shrink-0`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {STATUS_LABEL[job.status]}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
