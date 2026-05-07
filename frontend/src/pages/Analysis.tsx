import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayCircle, Instagram, Youtube, Loader2, CheckCircle2, XCircle, Terminal, Zap } from 'lucide-react'
import { useKeywords, useRunAnalysis } from '@/api/hooks'
import { BASE_WS } from '@/api/client'

type LogLine = { type: 'info' | 'success' | 'error'; text: string }

const LOG_COLOR: Record<string, string> = {
  info:    '#9ca3af',
  success: '#34d399',
  error:   '#f87171',
}

export default function Analysis() {
  const { data: keywords = [] } = useKeywords()
  const runMutation = useRunAnalysis()

  const [selectedKw, setSelectedKw] = useState<number[]>([])
  const [platform, setPlatform]     = useState('youtube')
  const [maxPosts, setMaxPosts]     = useState(30)
  const [jobId, setJobId]           = useState<string | null>(null)
  const [status, setStatus]         = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [progress, setProgress]     = useState(0)
  const [logs, setLogs]             = useState<LogLine[]>([])
  const wsRef  = useRef<WebSocket | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  function toggleKw(id: number) {
    setSelectedKw(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  useEffect(() => {
    if (!jobId) return
    const ws = new WebSocket(`${BASE_WS}/${jobId}`)
    wsRef.current = ws
    ws.onmessage = e => {
      const msg = JSON.parse(e.data)
      if (msg.progress !== undefined) setProgress(msg.progress)
      if (msg.log) setLogs(prev => [...prev, { type: msg.log_type ?? 'info', text: msg.log }])
      if (msg.status === 'done')  { setStatus('done');  ws.close() }
      if (msg.status === 'error') { setStatus('error'); ws.close() }
    }
    ws.onerror = () => setStatus('error')
    return () => ws.close()
  }, [jobId])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [logs])

  async function handleRun() {
    if (selectedKw.length === 0) return
    setLogs([{ type: 'info', text: '분석을 시작합니다...' }])
    setProgress(0)
    setStatus('running')
    const kwNames = keywords
      .filter((k: any) => selectedKw.includes(k.id))
      .map((k: any) => k.keyword)
    const res = await runMutation.mutateAsync({ keywords: kwNames, platform, max_posts: maxPosts })
    setJobId(res.job_id)
  }

  const running = status === 'running'
  const noneSelected = selectedKw.length === 0

  return (
    <div className="max-w-2xl space-y-5">
      {/* Config */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 space-y-5"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
            <Zap size={13} className="text-white" />
          </div>
          <h2 className="text-sm font-semibold text-white">분석 설정</h2>
        </div>

        {/* Keywords */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-medium text-gray-400">키워드 선택</label>
            <div className="flex gap-2 text-xs">
              <button onClick={() => setSelectedKw(keywords.map((k: any) => k.id))}
                className="text-brand-400 hover:text-brand-300 transition-colors">전체</button>
              <span className="text-gray-700">·</span>
              <button onClick={() => setSelectedKw([])}
                className="text-gray-500 hover:text-gray-300 transition-colors">초기화</button>
            </div>
          </div>
          {keywords.length === 0 ? (
            <p className="text-xs text-gray-600 py-3">키워드 관리 메뉴에서 먼저 키워드를 추가하세요.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw: any) => {
                const active = selectedKw.includes(kw.id)
                return (
                  <motion.button
                    key={kw.id}
                    onClick={() => toggleKw(kw.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: .97 }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
                    style={active ? {
                      background: 'linear-gradient(135deg, rgba(99,102,241,.3), rgba(139,92,246,.2))',
                      border: '1px solid rgba(99,102,241,.5)',
                      color: '#a5b4fc',
                      boxShadow: '0 2px 8px rgba(99,102,241,.2)',
                    } : {
                      background: 'rgba(255,255,255,.04)',
                      border: '1px solid rgba(255,255,255,.08)',
                      color: '#6b7280',
                    }}
                  >
                    #{kw.keyword}
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>

        {/* Platform */}
        <div>
          <label className="text-xs font-medium text-gray-400 block mb-2.5">플랫폼</label>
          <div className="flex gap-2">
            {[
              { v: 'youtube',   label: 'YouTube',   Icon: Youtube,   iconCls: 'text-red-400' },
              { v: 'instagram', label: 'Instagram',  Icon: Instagram, iconCls: 'text-pink-400' },
              { v: 'both',      label: '전체',       Icon: Zap,       iconCls: 'text-brand-400' },
            ].map(({ v, label, Icon, iconCls }) => {
              const active = platform === v
              return (
                <button key={v} onClick={() => setPlatform(v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150"
                  style={active ? {
                    background: 'rgba(99,102,241,.15)',
                    border: '1px solid rgba(99,102,241,.4)',
                    color: '#a5b4fc',
                  } : {
                    background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(255,255,255,.07)',
                    color: '#6b7280',
                  }}
                >
                  <Icon size={12} className={active ? 'text-brand-400' : iconCls} />
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Max posts */}
        <div>
          <label className="text-xs font-medium text-gray-400 flex items-center justify-between mb-2">
            <span>최대 수집 게시물</span>
            <span className="text-white font-semibold tabular-nums">{maxPosts}<span className="text-gray-600 font-normal">개</span></span>
          </label>
          <div className="relative">
            <input type="range" min={10} max={100} step={10} value={maxPosts}
              onChange={e => setMaxPosts(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #6366f1 ${(maxPosts - 10) / 90 * 100}%, rgba(255,255,255,.1) 0%)`,
                accentColor: '#6366f1',
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-700 mt-1.5 px-0.5">
            <span>10</span><span>55</span><span>100</span>
          </div>
        </div>

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={running || noneSelected || keywords.length === 0}
          className="btn-primary w-full py-3 text-sm"
        >
          {running
            ? <><Loader2 size={15} className="animate-spin" />분석 중…</>
            : <><PlayCircle size={15} />
               {selectedKw.length > 0
                 ? `${selectedKw.length}개 키워드 분석 시작`
                 : '키워드를 선택하세요'
               }
             </>
          }
        </button>
      </motion.div>

      {/* Progress + log */}
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="glass rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-3.5 flex items-center gap-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              {status === 'running' && <Loader2 size={14} className="text-brand-400 animate-spin flex-shrink-0" />}
              {status === 'done'    && <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />}
              {status === 'error'   && <XCircle size={14} className="text-red-400 flex-shrink-0" />}
              <span className="text-sm font-medium text-white">
                {status === 'running' ? '분석 진행 중' : status === 'done' ? '분석 완료' : '오류 발생'}
              </span>
              <span className="ml-auto text-xs text-gray-600 tabular-nums">{progress}%</span>
            </div>

            {/* Progress bar */}
            <div className="h-0.5" style={{ background: 'rgba(255,255,255,.05)' }}>
              <motion.div
                className="h-full"
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'linear', duration: .4 }}
                style={{
                  background: status === 'error'
                    ? 'linear-gradient(90deg, #ef4444, #f87171)'
                    : status === 'done'
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                }}
              />
            </div>

            {/* Terminal */}
            <div className="flex items-center gap-2 px-4 py-2"
              style={{ borderBottom: '1px solid rgba(255,255,255,.04)', background: 'rgba(0,0,0,.2)' }}>
              <Terminal size={11} className="text-gray-600" />
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">Output</span>
            </div>
            <div
              ref={logRef}
              className="h-52 overflow-y-auto p-4 space-y-1 font-mono text-xs"
              style={{ background: 'rgba(0,0,0,.3)' }}
            >
              {logs.map((l, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ color: LOG_COLOR[l.type] }}
                >
                  <span className="text-gray-700 mr-2 select-none">›</span>
                  {l.text}
                </motion.p>
              ))}
              {running && (
                <p className="text-gray-700 animate-pulse select-none">█</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
