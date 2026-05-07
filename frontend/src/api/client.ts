import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 30_000,
})

export const BASE_WS = import.meta.env.VITE_WS_URL ?? `ws://${location.host}/api/analysis/ws`
