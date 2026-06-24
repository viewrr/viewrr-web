import { describe, it, expect, beforeEach, vi } from 'vitest'
import { request, ApiError } from './http'
import { session } from './auth'
import { API_BASE } from './config'

function mockFetch(status: number, body: unknown = {}) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response)
}

describe('request', () => {
  beforeEach(() => {
    session.token = null
    session.refreshToken = null
  })

  it('prefixes API_BASE and defaults to GET', async () => {
    const f = mockFetch(200, { ok: 1 })
    vi.stubGlobal('fetch', f)
    await request('/media')
    expect(f).toHaveBeenCalledWith(`${API_BASE}/media`, expect.objectContaining({ method: 'GET' }))
  })

  it('omits Authorization when no token', async () => {
    const f = mockFetch(200)
    vi.stubGlobal('fetch', f)
    await request('/media')
    expect(f.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('sends Bearer token when present', async () => {
    session.token = 'abc'
    const f = mockFetch(200)
    vi.stubGlobal('fetch', f)
    await request('/me')
    expect(f.mock.calls[0][1].headers.Authorization).toBe('Bearer abc')
  })

  it('throws ApiError with status on non-2xx', async () => {
    vi.stubGlobal('fetch', mockFetch(500))
    await expect(request('/boom')).rejects.toBeInstanceOf(ApiError)
    await expect(request('/boom')).rejects.toMatchObject({ status: 500 })
  })

  it('refreshes once on 401 then retries', async () => {
    session.token = 'stale'
    session.refreshToken = 'r1'
    const f = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) }) // first call
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ token: 'fresh' }) }) // /auth/refresh
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ ok: 1 }) }) // retry
    vi.stubGlobal('fetch', f)
    const out = await request<{ ok: number }>('/me')
    expect(out.ok).toBe(1)
    expect(f).toHaveBeenCalledTimes(3)
  })
})
