import { reactive } from 'vue'
import { API_BASE } from './config'
import type { AuthTokens } from './types'

// ponytail: localStorage + a reactive singleton, no pinia. Bearer is opaque
// (legacy HS256 today, Keycloak OIDC later — contract says treat as opaque).
const TOKEN_KEY = 'viewrr_token'
const REFRESH_KEY = 'viewrr_refresh'

export const session = reactive<{ token: string | null; refreshToken: string | null }>({
  token: localStorage.getItem(TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_KEY),
})

export const isAuthenticated = () => !!session.token

function persist(t: AuthTokens | null) {
  session.token = t?.token ?? null
  session.refreshToken = t?.refreshToken ?? null
  if (t?.token) localStorage.setItem(TOKEN_KEY, t.token)
  else localStorage.removeItem(TOKEN_KEY)
  if (t?.refreshToken) localStorage.setItem(REFRESH_KEY, t.refreshToken)
  else localStorage.removeItem(REFRESH_KEY)
}

async function post(path: string, body?: unknown): Promise<AuthTokens> {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`${path} → ${res.status}`)
  return res.json()
}

export async function login(username: string, password: string) {
  persist(await post('/auth/login', { username, password }))
}

/** Refresh the bearer using the stored refresh token. Throws if none / fails. */
export async function refresh(): Promise<string> {
  if (!session.refreshToken) throw new Error('no refresh token')
  const t = await post('/auth/refresh', { refreshToken: session.refreshToken })
  persist(t)
  return t.token
}

export async function logout() {
  try {
    if (session.token) await post('/auth/logout')
  } finally {
    persist(null)
  }
}
