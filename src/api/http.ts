import { API_BASE } from './config'
import { session, refresh } from './auth'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

interface Opts {
  method?: string
  body?: unknown
  /** internal: prevents infinite refresh loops */
  _retried?: boolean
}

/** Typed JSON fetch with Bearer injection and a single 401→refresh→retry. */
export async function request<T>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (session.token) headers.Authorization = `Bearer ${session.token}`
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(API_BASE + path, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })

  if (res.status === 401 && !opts._retried && session.refreshToken) {
    await refresh()
    return request<T>(path, { ...opts, _retried: true })
  }
  if (!res.ok) throw new ApiError(res.status, `${opts.method ?? 'GET'} ${path} → ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
