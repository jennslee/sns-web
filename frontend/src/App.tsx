import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LangProvider } from '@/contexts/LangContext'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Keywords  from '@/pages/Keywords'
import Analysis  from '@/pages/Analysis'
import Results   from '@/pages/Results'
import Settings  from '@/pages/Settings'

export default function App() {
  return (
    <LangProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="keywords"  element={<Keywords />} />
          <Route path="analysis"  element={<Analysis />} />
          <Route path="results"   element={<Results />} />
          <Route path="settings"  element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </LangProvider>
  )
}
