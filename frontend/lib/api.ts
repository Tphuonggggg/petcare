// This helper will either call the real backend (when NEXT_PUBLIC_API_URL is set and mocks not forced)
// or use the in-memory `mockApi` when `localStorage.useMocks === 'true'` or `NEXT_PUBLIC_USE_MOCKS === 'true'`.
import * as mock from './mockApi'

function useMocks(): boolean {
  // FORCE DISABLE MOCKS - Always use real backend
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('🔧 Using real backend API:', process.env.NEXT_PUBLIC_API_URL)
    return false
  }
  
  try {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('useMocks')
      if (v === 'true') {
        console.log('⚠️ localStorage.useMocks is true - using mock data')
        return true
      }
    }
  } catch {}
  if ((process.env as any).NEXT_PUBLIC_USE_MOCKS === 'true') return true
  return false
}

function buildUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || ''
  return base ? `${base.replace(/\/$/, '')}/api${path.startsWith('/') ? path : '/' + path}` : `/api${path.startsWith('/') ? path : '/' + path}`
}

export async function apiGet(path: string) {
  if (useMocks()) return mock.apiGet(path)
  const url = buildUrl(path)
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`API GET ${url} failed: ${res.status} ${text}`)
    }
    return res.json()
  } catch (err: any) {
    throw new Error(`Network error when requesting ${url}: ${err?.message || err}`)
  }
}

export async function apiPost(path: string, body: any) {
  if (useMocks()) return mock.apiPost(path, body)
  const url = buildUrl(path)
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`API POST ${url} failed: ${res.status} ${text}`)
    }
    return res.json()
  } catch (err: any) {
    throw new Error(`Network error when requesting ${url}: ${err?.message || err}`)
  }
}

export async function apiPut(path: string, body: any) {
  if (useMocks()) return mock.apiPut(path, body)
  const url = buildUrl(path)
  try {
    const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`API PUT ${url} failed: ${res.status} ${text}`)
    }
    try { return await res.json() } catch { return null }
  } catch (err: any) {
    throw new Error(`Network error when requesting ${url}: ${err?.message || err}`)
  }
}

export async function apiDelete(path: string) {
  if (useMocks()) return (mock as any).apiDelete(path)
  const url = buildUrl(path)
  try {
    const res = await fetch(url, { method: 'DELETE' })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`API DELETE ${url} failed: ${res.status} ${text}`)
    }
    try { return await res.json() } catch { return null }
  } catch (err: any) {
    throw new Error(`Network error when requesting ${url}: ${err?.message || err}`)
  }
}
