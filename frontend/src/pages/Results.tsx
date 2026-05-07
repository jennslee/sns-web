import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart2, TrendingUp, ThumbsUp, Eye, MessageCircle,
  Instagram, Youtube, ChevronDown, ChevronUp, Search, Calendar,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import { useResults } from '@/api/hooks'
import { fmtNum, fmtDate } from '@/lib/utils'

const SENTIMENT_COLORS = ['#4ade80', '#94a3b8', '#f87171']
const PLATFORM_COLORS  = { instagram: '#ec4899', youtube: '#f87171' }

export default function Results() {
  const { data: results = [], isLoading } = useResults()
  const [search, setSearch]   = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  const filtered = results.filter((r: any) =>
    r.keyword?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="키워드 검색…"
          className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition"
        />
      </div>

      {isLoading && (
        <div className="text-center py-16 text-gray-600 text-sm">불러오는 중…</div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-600 text-sm">
          <BarChart2 size={32} className="mx-auto mb-2 opacity-30" />분석 결과가 없습니다
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((result: any, idx: number) => (
          <ResultCard
            key={result.id ?? idx}
            result={result}
            open={expanded === idx}
            onToggle={() => setExpanded(expanded === idx ? null : idx)}
          />
        ))}
      </div>
    </div>
  )
}

function ResultCard({ result, open, onToggle }: { result: any; open: boolean; onToggle: () => void }) {
  const sentimentData = (result.sentiment ?? []).map((s: any, i: number) => ({
    name: s.sentiment === 'positive' ? '긍정' : s.sentiment === 'negative' ? '부정' : '중립',
    value: s.count ?? 0,
  }))

  const topHashtags = (result.top_hashtags ?? []).slice(0, 8).map((h: any) => ({
    tag: h.tag ?? h[0],
    count: h.count ?? h[1],
  }))

  const topInfluencers = (result.top_influencers ?? []).slice(0, 5)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl overflow-hidden"
    >
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-800/20 transition text-left"
      >
        <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
          {result.platform === 'instagram'
            ? <Instagram size={15} className="text-pink-400" />
            : <Youtube size={15} className="text-red-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">#{result.keyword}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <Calendar size={10} />{fmtDate(result.created_at)}
          </p>
        </div>

        {/* Mini stats */}
        <div className="hidden sm:flex items-center gap-5 mr-3">
          <Stat icon={BarChart2}     value={fmtNum(result.total_posts ?? 0)}  label="게시물" />
          <Stat icon={Eye}           value={fmtNum(result.total_views ?? 0)}  label="조회수" />
          <Stat icon={ThumbsUp}      value={fmtNum(result.total_likes ?? 0)}  label="좋아요" />
          <Stat icon={MessageCircle} value={fmtNum(result.total_comments ?? 0)} label="댓글" />
        </div>

        {open ? <ChevronUp size={16} className="text-gray-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />}
      </button>

      {/* Expanded detail */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-gray-800 px-5 py-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {/* Sentiment pie */}
          {sentimentData.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-3">감성 분포</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                    {sentimentData.map((_: any, i: number) => <Cell key={i} fill={SENTIMENT_COLORS[i]} />)}
                  </Pie>
                  <Legend iconType="circle" iconSize={7} formatter={(v) => <span className="text-xs text-gray-400">{v}</span>} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top hashtags */}
          {topHashtags.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-3">인기 해시태그 Top 8</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topHashtags} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <YAxis type="category" dataKey="tag" tick={{ fill: '#9ca3af', fontSize: 10 }} width={70} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 3, 3, 0]} name="언급수" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top influencers */}
          {topInfluencers.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-3">인플루언서 Top 5</h3>
              <div className="space-y-2.5">
                {topInfluencers.map((inf: any, i: number) => {
                  const name = inf.author ?? inf.username ?? inf.channel_title ?? inf[0] ?? '알 수 없음'
                  const engagement = inf.total_engagement ?? inf.engagement ?? inf[1] ?? 0
                  const followers  = inf.followers ?? 0
                  const tier = inf.tier
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <span className="w-4 text-[10px] text-gray-600 font-mono flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{name}</p>
                        {followers > 0 && (
                          <p className="text-[10px] text-gray-600">팔로워 {fmtNum(followers)}</p>
                        )}
                      </div>
                      {tier && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            background: tier === 'mega' ? 'rgba(99,102,241,.15)' : 'rgba(16,185,129,.15)',
                            color: tier === 'mega' ? '#a5b4fc' : '#34d399',
                          }}>
                          {tier}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 flex-shrink-0 tabular-nums">{fmtNum(engagement)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Trend summary */}
          {result.trend_summary && (
            <div className="md:col-span-2 xl:col-span-3">
              <h3 className="text-xs font-semibold text-gray-400 mb-2">트렌드 요약</h3>
              <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{result.trend_summary}</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

function Stat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-xs font-semibold text-white">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  )
}
