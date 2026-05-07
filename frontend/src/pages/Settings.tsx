import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { useSettings, useSaveSettings } from '@/api/hooks'

type Field = {
  key: string
  label: string
  placeholder?: string
  secret?: boolean
  type?: 'text' | 'number' | 'select'
  options?: { value: string; label: string }[]
  min?: number; max?: number
}

const FIELDS: Field[] = [
  { key: 'youtube_api_key',    label: 'YouTube API Key',           placeholder: 'AIzaSy…',     secret: true },
  { key: 'instagram_username', label: 'Instagram 사용자명',         placeholder: '@username' },
  { key: 'instagram_password', label: 'Instagram 비밀번호',         placeholder: '••••••',      secret: true },
  { key: 'max_posts',          label: '기본 최대 수집 게시물',        type: 'number', min: 10, max: 200 },
  { key: 'max_comments',       label: '기본 최대 수집 댓글',          type: 'number', min: 10, max: 500 },
  { key: 'default_platform',   label: '기본 플랫폼', type: 'select',
    options: [
      { value: 'both',      label: '전체' },
      { value: 'youtube',   label: 'YouTube' },
      { value: 'instagram', label: 'Instagram' },
    ]},
  { key: 'drive_folder_id',    label: 'Google Drive 폴더 ID',      placeholder: '1A2B3C…' },
  { key: 'spreadsheet_id',     label: 'Google Spreadsheet ID',     placeholder: '1A2B3C…' },
]

export default function Settings() {
  const { data: settings, isLoading } = useSettings()
  const saveMutation = useSaveSettings()

  const [form, setForm]       = useState<Record<string, any>>({})
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    if (settings) setForm(settings)
  }, [settings])

  function set(key: string, val: any) {
    setForm(prev => ({ ...prev, [key]: val }))
    setSaved(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await saveMutation.mutateAsync(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (isLoading) return <div className="text-gray-500 text-sm py-10 text-center">불러오는 중…</div>

  return (
    <form onSubmit={handleSave} className="max-w-xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300">API 설정</h2>
        {FIELDS.slice(0, 3).map(f => <SettingField key={f.key} field={f} value={form[f.key] ?? ''} onChange={v => set(f.key, v)} visible={visible[f.key]} onToggleVisible={() => setVisible(p => ({ ...p, [f.key]: !p[f.key] }))} />)}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300">수집 설정</h2>
        {FIELDS.slice(3, 6).map(f => <SettingField key={f.key} field={f} value={form[f.key] ?? ''} onChange={v => set(f.key, v)} />)}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300">외부 연동</h2>
        {FIELDS.slice(6).map(f => <SettingField key={f.key} field={f} value={form[f.key] ?? ''} onChange={v => set(f.key, v)} />)}
      </motion.div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-brand-600/30"
        >
          <Save size={15} />
          {saveMutation.isPending ? '저장 중…' : '설정 저장'}
        </button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 text-sm text-emerald-400"
          >
            <CheckCircle2 size={14} />저장되었습니다
          </motion.span>
        )}
        {saveMutation.isError && (
          <span className="flex items-center gap-1 text-sm text-red-400">
            <AlertCircle size={14} />저장 실패
          </span>
        )}
      </div>
    </form>
  )
}

function SettingField({
  field, value, onChange, visible, onToggleVisible,
}: {
  field: Field
  value: any
  onChange: (v: any) => void
  visible?: boolean
  onToggleVisible?: () => void
}) {
  const inputClass =
    'w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition'

  return (
    <div>
      <label className="text-xs text-gray-400 block mb-1.5">{field.label}</label>
      {field.type === 'select' ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className={inputClass}
        >
          {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : field.type === 'number' ? (
        <input
          type="number" min={field.min} max={field.max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className={inputClass}
        />
      ) : (
        <div className="relative">
          <input
            type={field.secret && !visible ? 'password' : 'text'}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={`${inputClass} ${field.secret ? 'pr-10' : ''}`}
          />
          {field.secret && (
            <button
              type="button"
              onClick={onToggleVisible}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
            >
              {visible ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
