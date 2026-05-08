import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart2, ThumbsUp, Eye, MessageCircle,
  Instagram, Youtube, ChevronDown, ChevronUp, Search, Calendar,
  Download, X,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useResults } from '@/api/hooks'
import { fmtNum, fmtDate } from '@/lib/utils'

const SENTIMENT_COLORS = ['#4ade80', '#94a3b8', '#f87171']

function chartUrl(path: string) {
  return `/api/analysis/reports/chart?path=${encodeURIComponent(path)}`
}
function excelUrl(path: string) {
  return `/api/analysis/reports/excel?path=${encodeURIComponent(path)}`
}
function chartLabel(path: string) {
  const name = path.replace(/\\/g, '/').split('/').pop() ?? ''
  if (name.includes('hashtag_network')) return '해시태그 네트워크'
  if (name.includes('hashtag'))   return '해시태그'
  if (name.includes('trend'))     return '트렌드'
  if (name.includes('sentiment')) return '감성'
  if (name.includes('influencer'))return '인플루언서'
  if (name.includes('wordcloud')) return '워드클라우드'
  return name.replace(/\.[^.]+$/, '')
}

export default function Results() {
  const { data: results = [], isLoading } = useResults()
  const [search, setSearch]     = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  const filtered = (results as any[]).filter(r =>
    r.keyword?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="키워드 검색…"
          className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition"
        />
      </div>

      {isLoading && <p className="text-center py-16 text-gray-600 text-sm">불러오는 중…</p>}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-600 text-sm">
          <BarChart2 size={32} className="mx-auto mb-2 opacity-30" />
          분석 결과가 없습니다
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
  const [lightbox, setLightbox] = useState<string | null>(null)

  const sentimentData: any[] = (result.sentiment ?? []).map((s: any) => ({
    name: s.sentiment === 'positive' ? '긍정' : s.sentiment === 'negative' ? '부정' : '중립',
    value: s.count ?? 0,
  }))
  const topHashtags: any[] = (result.top_hashtags ?? []).slice(0, 8).map((h: any) => ({
    tag: h.tag ?? h[0], count: h.count ?? h[1],
  }))
  const topInfluencers: any[] = (result.top_influencers ?? []).slice(0, 5)
  const chartPaths: string[]  = (result.chart_paths ?? []).filter(Boolean)
  const excelPath: string     = result.excel_path ?? ''

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Header */}
      <button onClick={onToggle} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors text-left">
        <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
          {result.platform === 'instagram'
            ? <Instagram size={15} className="text-pink-400" />
            : <Youtube   size={15} className="text-red-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">#{result.keyword}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <Calendar size={10} />{fmtDate(result.created_at)}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-5 mr-3">
          <MiniStat icon={BarChart2}     v={fmtNum(result.total_posts    ?? 0)} label="게시물" />
          <MiniStat icon={Eye}           v={fmtNum(result.total_views    ?? 0)} label="조회수" />
          <MiniStat icon={ThumbsUp}      v={fmtNum(result.total_likes    ?? 0)} label="좋아요" />
          <MiniStat icon={MessageCircle} v={fmtNum(result.total_comments ?? 0)} label="댓글"  />
        </div>
        {open
          ? <ChevronUp   size={16} className="text-gray-500 flex-shrink-0" />
          : <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />}
      </button>

      {/* Expanded */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t border-gray-800">

              {/* Chart gallery */}
              {chartPaths.length > 0 && (
                <div className="px-5 pt-5 pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-gray-400">분석 차트 ({chartPaths.length}개)</p>
                    {excelPath && (
                      <a href={excelUrl(excelPath)} download
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(16,185,129,.15)', color: '#34d399', border: '1px solid rgba(16,185,129,.25)' }}>
                        <Download size={11} />엑셀 다운로드
                      </a>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {chartPaths.map((p, i) => (
                      <ChartThumb key={i} path={p} onClick={() => setLightbox(p)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Charts + Influencers */}
              <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sentimentData.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-3">감성 분포</p>
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

                {topHashtags.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-3">인기 해시태그 Top 8</p>
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

                {topInfluencers.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-3">인플루언서 Top 5</p>
                    <div className="space-y-2.5">
                      {topInfluencers.map((inf: any, i: number) => {
                        const name = inf.author ?? inf.username ?? inf.channel_title ?? '알 수 없음'
                        const platform = inf.platform ?? result.platform ?? 'youtube'
                        const profileUrl = platform === 'instagram'
                          ? `https://www.instagram.com/${name.replace('@', '')}/`
                          : `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}+channel`
                        return (
                          <div key={i} className="flex items-center gap-2.5">
                            <span className="w-4 text-[10px] text-gray-600 font-mono flex-shrink-0">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <a
                                href={profileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-white truncate block hover:text-brand-400 transition-colors"
                              >
                                {name}
                              </a>
                              {(inf.followers ?? 0) > 0 && (
                                <p className="text-[10px] text-gray-600">팔로워 {fmtNum(inf.followers)}</p>
                              )}
                            </div>
                            {inf.tier && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                                style={{
                                  background: inf.tier === 'mega' ? 'rgba(99,102,241,.15)' : 'rgba(16,185,129,.15)',
                                  color:      inf.tier === 'mega' ? '#a5b4fc'              : '#34d399',
                                }}>
                                {inf.tier}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 tabular-nums flex-shrink-0">
                              {fmtNum(inf.total_engagement ?? inf.engagement ?? 0)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: .9 }} animate={{ scale: 1 }} exit={{ scale: .9 }}
              className="relative max-w-4xl w-full rounded-2xl overflow-hidden bg-gray-900"
              onClick={e => e.stopPropagation()}
            >
              <img src={chartUrl(lightbox)} alt="chart" className="w-full h-auto" />
              <button onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-black/60">
                <X size={14} className="text-white" />
              </button>
              <a href={chartUrl(lightbox)} download
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-black/60 text-gray-200"
                onClick={e => e.stopPropagation()}>
                <Download size={11} />저장
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ChartThumb({ path, onClick }: { path: string; onClick: () => void }) {
  const [err, setErr] = useState(false)
  if (err) return null
  return (
    <button onClick={onClick}
      className="relative rounded-lg overflow-hidden border border-gray-800 hover:border-brand-500/50 transition-colors group"
      style={{ aspectRatio: '4/3', background: 'rgba(0,0,0,.4)' }}>
      <img
        src={chartUrl(path)}
        alt={chartLabel(path)}
        onError={() => setErr(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-x-0 bottom-0 px-2 py-1 text-[10px] text-gray-200 text-left"
        style={{ background: 'linear-gradient(transparent, rgba(0,0,0,.7))' }}>
        {chartLabel(path)}
      </div>
    </button>
  )
}

function MiniStat({ icon: Icon, v, label }: { icon: any; v: string; label: string }) {
  return (
    <div className="text-center">
      <Icon size={10} className="text-gray-600 mx-auto mb-0.5" />
      <p className="text-xs font-semibold text-white">{v}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  )
}
