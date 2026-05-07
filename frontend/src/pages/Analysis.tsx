import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { PlayCircle, Instagram, Youtube, Loader2, CheckCircle2, XCircle, ChevronDown } from 'lucide-react'
import { useKeywords, useRunAnalysis } from '@/api/hooks'
import { API_BASE } from '@/api/client'

type LogLine = { type: 'info' | 'success' | 'error'; text: string }

export default function Analysis() {
  const { data: keywords = [] } = useKeywords()
  const runMutation = useRunAnalysis()

  const [selectedKw, setSelectedKw]   = useState<number[]>([])
  const [platform, setPlatform]       = useState('both')
  const [maxPosts, setMaxPosts]       = useState(30)
  const [jobId, setJobId]             = useState<string | null>(null)
  const [status, setStatus]           = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [progress, setProgress]       = useState(0)
  const [logs, setLogs]               = useState<LogLine[]>([])
  const wsRef  = useRef<WebSocket | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  function toggleKw(id: number) {
    setSelectedKw(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function selectAll() { setSelectedKw(keywords.map((k: any) => k.id)) }
  function clearAll()  { setSelectedKw([]) }

  useEffect(() => {
    if (!jobId) return
    const ws = new WebSocket(`ws://${window.location.hostname}:8000/api/analysis/ws/${jobId}`)
    wsRef.current = ws
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.progress !== undefined) setProgress(msg.progress)
      if (msg.log)   setLogs(prev => [...prev, { type: msg.log_type ?? 'info', text: msg.log }])
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
    setLogs([])
    setProgress(0)
    setStatus('running')
    const kwNames = keywords
      .filter((k: any) => selectedKw.includes(k.id))
      .map((k: any) => k.keyword)
    const res = await runMutation.mutateAsync({ keywords: kwNames, platform, max_posts: maxPosts })
    setJobId(res.job_id)
  }

  const running = status === 'running'

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Config panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-5 space-y-5"
      >
        <h2 className="text-sm font-semibold text-gray-300">분석 설정</h2>

        {/* Keyword selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-400">키워드 선택</label>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs text-brand-400 hover:text-brand-300 transition">전체 선택</button>
              <span className="text-gray-700">|</span>
              <button onClick={clearAll}  className="text-xs text-gray-500 hover:text-gray-300 transition">초기화</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw: any) => (
              <button
                key={kw.id}
                onClick={() => toggleKw(kw.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                  selectedKw.includes(kw.id)
                    ? 'bg-brand-600 border-brand-500 text-white'
                    : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                #{kw.keyword}
              </button>
            ))}
            {keywords.length === 0 && (
              <p className="text-xs text-gray-600">등록된 키워드가 없습니다. 키워드 관리에서 추가하세요.</p>
            )}
          </div>
        </div>

        {/* Platform */}
        <div>
          <label className="text-xs text-gray-400 mb-2 block">플랫폼</label>
          <div className="flex gap-2">
            {[
              { v: 'both',      label: '전체' },
              { v: 'instagram', label: 'Instagram', Icon: Instagram, cls: 'text-pink-400' },
              { v: 'youtube',   label: 'YouTube',   Icon: Youtube,   cls: 'text-red-400'  },
            ].map(({ v, label, Icon, cls }) => (
              <button
                key={v}
                onClick={() => setPlatform(v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition border ${
                  platform === v
                    ? 'bg-brand-600 border-brand-500 text-white'
                    : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {Icon && <Icon size={12} className={platform === v ? 'text-white' : cls} />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Max posts */}
        <div>
          <label className="text-xs text-gray-400 mb-2 flex items-center justify-between">
            <span>최대 수집 게시물</span>
            <span className="text-white font-medium">{maxPosts}개</span>
          </label>
          <input
            type="range" min={10} max={100} step={10} value={maxPosts}
            onChange={e => setMaxPosts(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>10</span><span>50</span><span>100</span>
          </div>
        </div>

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={running || selectedKw.length === 0}
          className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-brand-600/30"
        >
          {running
            ? <><Loader2 size={16} className="animate-spin" />분석 중…</>
            : <><PlayCircle size={16} />분석 시작</>
          }
        </button>
      </motion.div>

      {/* Progress + log */}
      {status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status === 'running' && <Loader2 size={14} className="text-brand-400 animate-spin" />}
              {status === 'done'    && <CheckCircle2 size={14} className="text-emerald-400" />}
              {status === 'error'   && <XCircle size={14} className="text-red-400" />}
              <span className="text-sm font-semibold text-gray-300">
                {status === 'running' ? '분석 진행 중' : status === 'done' ? '분석 완료' : '오류 발생'}
              </span>
            </div>
            <span className="text-xs text-gray-500">{progress}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-800">
            <motion.div
              className={`h-full ${status === 'error' ? 'bg-red-500' : 'bg-brand-500'}`}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'linear', duration: 0.3 }}
            />
          </div>

          {/* Log terminal */}
          <div
            ref={logRef}
            className="h-52 overflow-y-auto p-4 font-mono text-xs space-y-0.5 bg-gray-950/60"
          >
            {logs.map((l, i) => (
              <p key={i} className={
                l.type === 'success' ? 'text-emerald-400'
                : l.type === 'error' ? 'text-red-400'
                : 'text-gray-400'
              }>
                {l.text}
              </p>
            ))}
            {running && <p className="text-gray-600 animate-pulse">▌</p>}
          </div>
        </motion.div>
      )}
    </div>
  )
}
