import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Eye, EyeOff, CheckCircle2, AlertCircle, Settings2, Key, Globe, Database } from 'lucide-react'
import { useSettings, useSaveSettings } from '@/api/hooks'

type Field = {
  key: string; label: string; placeholder?: string
  secret?: boolean; type?: 'text' | 'number' | 'select'
  options?: { value: string; label: string }[]; min?: number; max?: number
  hint?: string
}

const SECTIONS = [
  {
    id: 'api', title: 'API 키', icon: Key,
    desc: '외부 플랫폼 연동에 필요한 키를 입력하세요',
    fields: [
      { key: 'youtube_api_key',    label: 'YouTube API Key',   placeholder: 'AIzaSy…', secret: true, hint: 'Google Cloud Console에서 발급' },
      { key: 'instagram_username', label: 'Instagram 사용자명', placeholder: '@username', hint: '선택사항 (2024년 이후 제한됨)' },
      { key: 'instagram_password', label: 'Instagram 비밀번호', placeholder: '••••••',   secret: true },
    ] as Field[],
  },
  {
    id: 'collection', title: '수집 설정', icon: Database,
    desc: '데이터 수집 기본값을 설정합니다',
    fields: [
      { key: 'max_posts',    label: '기본 최대 수집 게시물', type: 'number', min: 10, max: 200 },
      { key: 'max_comments', label: '기본 최대 수집 댓글',   type: 'number', min: 10, max: 500 },
      { key: 'default_platform', label: '기본 플랫폼', type: 'select',
        options: [
          { value: 'both',      label: '전체 (YouTube + Instagram)' },
          { value: 'youtube',   label: 'YouTube만' },
          { value: 'instagram', label: 'Instagram만' },
        ]},
    ] as Field[],
  },
  {
    id: 'integration', title: '외부 연동', icon: Globe,
    desc: 'Google Drive, Spreadsheet 연동 설정',
    fields: [
      { key: 'drive_folder_id',  label: 'Google Drive 폴더 ID',   placeholder: '1A2B3C…', hint: '분석 결과가 저장될 폴더의 ID' },
      { key: 'spreadsheet_id',   label: 'Google Spreadsheet ID',  placeholder: '1A2B3C…', hint: '키워드를 가져올 시트 ID' },
    ] as Field[],
  },
]

export default function Settings() {
  const { data: settings, isLoading } = useSettings()
  const saveMutation = useSaveSettings()

  const [form, setForm]       = useState<Record<string, any>>({})
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [saved, setSaved]     = useState(false)

  useEffect(() => { if (settings) setForm(settings) }, [settings])

  function set(key: string, val: any) { setForm(p => ({ ...p, [key]: val })); setSaved(false) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await saveMutation.mutateAsync(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (isLoading) return (
    <div className="space-y-4 max-w-xl">
      {[1,2,3].map(i => <div key={i} className="glass rounded-2xl h-40 shimmer" />)}
    </div>
  )

  return (
    <form onSubmit={handleSave} className="max-w-xl space-y-5">
      {SECTIONS.map(({ id, title, icon: Icon, desc, fields }, si) => (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * .08 }}
          className="glass rounded-2xl overflow-hidden"
        >
          {/* Section header */}
          <div className="px-5 py-4 flex items-center gap-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,.05)', background: 'rgba(255,255,255,.02)' }}>
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
              <Icon size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">{title}</h2>
              <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
            </div>
          </div>

          {/* Fields */}
          <div className="p-5 space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="text-xs font-medium text-gray-400 block mb-1.5">{f.label}</label>
                {f.type === 'select' ? (
                  <select value={form[f.key] ?? ''}
                    onChange={e => set(f.key, e.target.value)}
                    className="input">
                    {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === 'number' ? (
                  <input type="number" min={f.min} max={f.max}
                    value={form[f.key] ?? ''}
                    onChange={e => set(f.key, Number(e.target.value))}
                    className="input" />
                ) : (
                  <div className="relative">
                    <input
                      type={f.secret && !visible[f.key] ? 'password' : 'text'}
                      value={form[f.key] ?? ''}
                      onChange={e => set(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className={`input ${f.secret ? 'pr-10' : ''}`}
                    />
                    {f.secret && (
                      <button type="button"
                        onClick={() => setVisible(p => ({ ...p, [f.key]: !p[f.key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
                        {visible[f.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                  </div>
                )}
                {f.hint && <p className="text-[10px] text-gray-600 mt-1">{f.hint}</p>}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Save row */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }}
        className="flex items-center gap-3 pt-1"
      >
        <button type="submit" disabled={saveMutation.isPending} className="btn-primary px-6 py-2.5">
          <Save size={14} />
          {saveMutation.isPending ? '저장 중…' : '설정 저장'}
        </button>
        <AnimatePresence>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
              className="flex items-center gap-1.5 text-sm text-emerald-400"
            >
              <CheckCircle2 size={14} />저장되었습니다
            </motion.span>
          )}
          {saveMutation.isError && (
            <motion.span
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 text-sm text-red-400"
            >
              <AlertCircle size={14} />저장 실패
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </form>
  )
}
