import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Hash, Instagram, Youtube, Search, Tag } from 'lucide-react'
import { useKeywords, useCreateKeyword, useDeleteKeyword } from '@/api/hooks'
import { fmtDate } from '@/lib/utils'

const PLATFORMS = [
  { value: 'both',      label: '전체',      cls: 'badge-purple' },
  { value: 'instagram', label: 'Instagram', cls: 'badge-red' },
  { value: 'youtube',   label: 'YouTube',   cls: 'badge-red' },
]

export default function Keywords() {
  const { data: keywords = [], isLoading } = useKeywords()
  const createMutation = useCreateKeyword()
  const deleteMutation = useDeleteKeyword()

  const [word, setWord]         = useState('')
  const [platform, setPlatform] = useState('both')
  const [filter, setFilter]     = useState('')
  const [error, setError]       = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = word.trim().replace(/^#/, '')
    if (!trimmed) { setError('키워드를 입력하세요.'); return }
    setError('')
    try {
      await createMutation.mutateAsync({ keyword: trimmed, platform })
      setWord('')
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? '이미 등록된 키워드입니다.')
    }
  }

  const filtered = keywords.filter((k: any) =>
    k.keyword?.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="max-w-2xl space-y-5">
      {/* Add card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
            <Tag size={13} className="text-white" />
          </div>
          <h2 className="text-sm font-semibold text-white">키워드 추가</h2>
        </div>

        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">#</span>
              <input
                value={word}
                onChange={e => { setWord(e.target.value); setError('') }}
                placeholder="키워드 입력 (예: AI, 축구)"
                className="input pl-7"
              />
            </div>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary px-4">
              <Plus size={15} strokeWidth={2.5} />
              추가
            </button>
          </div>

          {/* Platform selector */}
          <div className="flex gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p.value} type="button"
                onClick={() => setPlatform(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                  platform === p.value
                    ? 'text-white border-brand-500/50'
                    : 'text-gray-500 border-transparent hover:border-white/10 hover:text-gray-300'
                }`}
                style={platform === p.value ? {
                  background: 'linear-gradient(135deg, rgba(99,102,241,.25), rgba(139,92,246,.15))',
                  boxShadow: '0 0 0 1px rgba(99,102,241,.3)',
                } : {
                  background: 'rgba(255,255,255,.04)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-400 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-red-400" />
              {error}
            </motion.p>
          )}
        </form>
      </motion.div>

      {/* List card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="px-5 py-4 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="검색…"
              className="input pl-8 py-2 text-xs h-8"
            />
          </div>
          <span className="badge badge-gray text-[10px] flex-shrink-0">
            {keywords.length} 개
          </span>
        </div>

        <AnimatePresence initial={false}>
          {filtered.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-14 text-center"
            >
              <Hash size={28} className="mx-auto text-gray-700 mb-2" />
              <p className="text-sm text-gray-600">
                {keywords.length === 0 ? '등록된 키워드가 없습니다' : '검색 결과 없음'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <AnimatePresence>
            {filtered.map((kw: any, i: number) => (
              <motion.div
                key={kw.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: .2 }}
                className="group flex items-center gap-3.5 px-5 py-3.5 transition-colors duration-150"
                style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.025)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,.2), rgba(139,92,246,.1))', border: '1px solid rgba(99,102,241,.2)' }}>
                  <Hash size={13} className="text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">#{kw.keyword}</p>
                  {kw.created_at && <p className="text-xs text-gray-600 mt-0.5">{fmtDate(kw.created_at)}</p>}
                </div>
                <PlatformBadge platform={kw.platform} />
                <button
                  onClick={() => deleteMutation.mutate(kw.id)}
                  disabled={deleteMutation.isPending}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-600 hover:text-red-400 transition-all duration-150"
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  data-tooltip="삭제"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

function PlatformBadge({ platform }: { platform: string }) {
  if (platform === 'instagram')
    return <span className="badge" style={{ background: 'rgba(236,72,153,.1)', color: '#f472b6', border: '1px solid rgba(236,72,153,.2)' }}><Instagram size={10} />Instagram</span>
  if (platform === 'youtube')
    return <span className="badge" style={{ background: 'rgba(239,68,68,.1)', color: '#f87171', border: '1px solid rgba(239,68,68,.2)' }}><Youtube size={10} />YouTube</span>
  return <span className="badge badge-purple">전체</span>
}
