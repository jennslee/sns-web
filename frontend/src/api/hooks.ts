import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

// ── Keywords ────────────────────────────────────────────────────────────────
export const useKeywords = () =>
  useQuery({ queryKey: ['keywords'], queryFn: () => api.get('/keywords/').then(r => r.data) })

export const useCreateKeyword = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { keyword: string; platform: string }) =>
      api.post('/keywords/', body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['keywords'] }),
  })
}

export const useDeleteKeyword = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/keywords/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['keywords'] }),
  })
}

// ── Jobs ────────────────────────────────────────────────────────────────────
export const useJobs = () =>
  useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.get('/analysis/jobs').then(r => r.data),
    refetchInterval: 3000,
  })

export const useJob = (id: number | null) =>
  useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get(`/analysis/jobs/${id}`).then(r => r.data),
    enabled: id != null,
    refetchInterval: (q) => (q.state.data?.status === 'running' ? 1500 : false),
  })

export const useRunAnalysis = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { keywords: string[]; platform: string; max_posts: number }) =>
      api.post('/analysis/run', body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

// ── Results ─────────────────────────────────────────────────────────────────
export const useResults = () =>
  useQuery({ queryKey: ['results'], queryFn: () => api.get('/analysis/results').then(r => r.data) })

export const useResult = (id: number | null) =>
  useQuery({
    queryKey: ['result', id],
    queryFn: () => api.get(`/analysis/results/${id}`).then(r => r.data),
    enabled: id != null,
  })

// ── Settings ─────────────────────────────────────────────────────────────────
export const useSettings = () =>
  useQuery({ queryKey: ['settings'], queryFn: () => api.get('/settings/').then(r => r.data) })

export const useSaveSettings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.put('/settings/', body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })
}
