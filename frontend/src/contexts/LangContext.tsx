import { createContext, useContext, useState, ReactNode } from 'react'

export type Lang = 'ko' | 'en'

const KO = {
  nav: { menu: '메뉴', system: '시스템', dashboard: '대시보드', keywords: '키워드', analysis: '분석 실행', results: '결과 보기', settings: '설정' },
  dashboard: { title: '대시보드', totalKeywords: '등록 키워드', totalJobs: '총 분석 횟수', recentJobs: '최근 분석', noJobs: '아직 분석 기록이 없습니다' },
  keywords: { title: '키워드 관리', add: '추가', placeholder: '키워드 입력', noKeywords: '등록된 키워드가 없습니다', deleteConfirm: '삭제하시겠습니까?' },
  analysis: { title: '분석 실행', selectKeywords: '키워드 선택', all: '전체', reset: '초기화', platform: '플랫폼', maxPosts: '최대 수집 게시물', start: '개 키워드 분석 시작', noKeywords: '키워드를 선택하세요', running: '분석 중…', done: '분석 완료', error: '오류 발생' },
  results: { title: '결과', noResults: '결과 없음' },
  settings: { title: '설정', save: '설정 저장', saving: '저장 중…', saved: '저장되었습니다', saveFailed: '저장 실패', appearance: '화면 설정', appearanceDesc: '언어 및 인터페이스 설정', language: '언어' },
  status: { systemOk: '시스템 정상', free: 'Free' },
}

const EN: typeof KO = {
  nav: { menu: 'Menu', system: 'System', dashboard: 'Dashboard', keywords: 'Keywords', analysis: 'Analysis', results: 'Results', settings: 'Settings' },
  dashboard: { title: 'Dashboard', totalKeywords: 'Keywords', totalJobs: 'Analyses', recentJobs: 'Recent Analyses', noJobs: 'No analysis records yet' },
  keywords: { title: 'Keywords', add: 'Add', placeholder: 'Enter keyword', noKeywords: 'No keywords registered', deleteConfirm: 'Delete this keyword?' },
  analysis: { title: 'Run Analysis', selectKeywords: 'Select Keywords', all: 'All', reset: 'Clear', platform: 'Platform', maxPosts: 'Max Posts', start: ' keyword(s) selected', noKeywords: 'Select keywords', running: 'Analyzing…', done: 'Done', error: 'Error' },
  results: { title: 'Results', noResults: 'No results' },
  settings: { title: 'Settings', save: 'Save Settings', saving: 'Saving…', saved: 'Saved', saveFailed: 'Save failed', appearance: 'Appearance', appearanceDesc: 'Language and interface settings', language: 'Language' },
  status: { systemOk: 'System OK', free: 'Free' },
}

const DICT: Record<Lang, typeof KO> = { ko: KO, en: EN }

const Ctx = createContext<{ lang: Lang; t: typeof KO; setLang: (l: Lang) => void }>({ lang: 'ko', t: KO, setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('ui_language') as Lang) ?? 'ko')

  function setLang(l: Lang) {
    localStorage.setItem('ui_language', l)
    setLangState(l)
  }

  return <Ctx.Provider value={{ lang, t: DICT[lang], setLang }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
