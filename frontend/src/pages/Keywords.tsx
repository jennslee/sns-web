import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Hash, Instagram, Youtube, RefreshCw } from 'lucide-react'
import { useKeywords, useCreateKeyword, useDeleteKeyword } from '@/api/hooks'

const PLATFORM_OPTIONS = [
  { value: 'both',      label: '전체',     icon: null },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'youtube',   label: 'YouTube',   icon: Youtube },
]

export default function Keywords() {
  const { data: keywords = [], isLoading } = useKeywords()
  const createMutation = useCreateKeyword()
  const deleteMutation = useDeleteKeyword()

  const [word, setWord]         = useState('')
  const [platform, setPlatform] = useState('both')
  const [error, setError]       = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = word.trim().replace(/^#/, '')
    if (!trimmed) { setError('키워드를 입력하세요.'); return }
    if (keywords.some((k: any) => k.keyword === trimmed && k.platform === platform)) {
      setError('이미 등록된 키워드입니다.')
      return
    }
    setError('')
    await createMutation.mutateAsync({ keyword: trimmed, platform })
    setWord('')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Add form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-5"
      >
        <h2 className="text-sm font-semibold text-gray-300 mb-4">키워드 추가</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">#</span>
              <input
                value={word}
                onChange={e => { setWord(e.target.value); setError('') }}
                placeholder="키워드 입력"
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-7 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
            >
              {PLATFORM_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
            >
              <Plus size={15} />추가
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
      </motion.div>

      {/* Keyword list */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300">등록된 키워드 ({keywords.length})</h2>
          {isLoading && <RefreshCw size={14} className="text-gray-500 animate-spin" />}
        </div>

        <div className="divide-y divide-gray-800/60">
          <AnimatePresence initial={false}>
            {keywords.map((kw: any, i: number) => (
              <motion.div
                key={kw.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/30 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <Hash size={14} className="text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">#{kw.keyword}</p>
                </div>
                <PlatformBadge platform={kw.platform} />
                <button
                  onClick={() => deleteMutation.mutate(kw.id)}
                  disabled={deleteMutation.isPending}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 transition rounded-lg hover:bg-red-400/10"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {!isLoading && keywords.length === 0 && (
            <div className="py-12 text-center text-gray-600 text-sm">
              <Hash size={28} className="mx-auto mb-2 opacity-30" />
              등록된 키워드가 없습니다
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function PlatformBadge({ platform }: { platform: string }) {
  if (platform === 'instagram')
    return <span className="flex items-center gap-1 text-xs text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded-full"><Instagram size={10} />Instagram</span>
  if (platform === 'youtube')
    return <span className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full"><Youtube size={10} />YouTube</span>
  return <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full">전체</span>
}
