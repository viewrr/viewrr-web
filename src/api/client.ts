import { request } from './http'
import type {
  MediaItem,
  ContinueWatchingItem,
  Recommendation,
  Album,
  ShowView,
  PlaybackInfo,
  WatchEvent,
  WalletOptInResponse,
  WalletStatus,
  MeshStatus,
} from './types'

// Endpoint methods map 1:1 to docs/api/client-api.md. 🔜 marks server gaps
// (Phase 20) — calling them is correct; callers handle failure until they land.
export const api = {
  // Home rows
  continueWatching: () => request<ContinueWatchingItem[]>('/me/continue-watching'),
  recommendations: () => request<Recommendation[]>('/me/recommendations'),
  recentlyAdded: () => request<MediaItem[]>('/media?sort=createdAt&order=desc'),
  top10: () => request<MediaItem[]>('/home/top'),
  featured: () => request<MediaItem[]>('/home/featured'),
  series: () => request<ShowView[]>('/series'),
  musicAlbums: () => request<Album[]>('/music/albums'),

  // Detail / search
  mediaDetail: (id: string) => request<MediaItem>(`/media/${id}`),
  search: (q: string) => request<MediaItem[]>(`/media/search?q=${encodeURIComponent(q)}`),

  // Playback
  playback: (id: string) => request<PlaybackInfo>(`/playback/${id}`), // 🔜
  mintStremioKey: () => request<{ key: string }>('/me/stremio-key', { method: 'POST' }),

  // Watch progress
  postWatchEvent: (e: WatchEvent) =>
    request<void>('/watch-events', { method: 'POST', body: e }),
  watchEventsMe: () => request<WatchEvent[]>('/watch-events/me'),

  // Payments — opt-in wallet (display-only; ADR p2p-0020). Contract PINNED with
  // mesh-hub (2026-07-07) — not in client-api.md yet, but the shape below is final,
  // not provisional. 🔜 mesh-hub is implementing the Hub route.
  walletOptIn: () =>
    request<WalletOptInResponse>('/api/pay/wallet/opt-in', { method: 'POST' }),
  wallet: () => request<WalletStatus>('/api/pay/wallet'),

  // Mesh availability — read-only status (ADR p2p-0008/p2p-0014). 🔜
  meshStatus: () => request<MeshStatus>('/me/mesh'),
}

export { ApiError } from './http'
export { login, logout, refresh, isAuthenticated, session } from './auth'
export type {
  MediaItem,
  ContinueWatchingItem,
  Recommendation,
  Album,
  ShowView,
  PlaybackInfo,
  WatchEvent,
  WalletOptInResponse,
  WalletStatus,
  MeshStatus,
} from './types'
