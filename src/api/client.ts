import { request } from './http'
import type {
  MediaItem,
  ContinueWatchingItem,
  PlaybackInfo,
  WatchEvent,
} from './types'

// Endpoint methods map 1:1 to docs/api/client-api.md. 🔜 marks server gaps
// (Phase 20) — calling them is correct; callers handle failure until they land.
export const api = {
  // Home rows
  continueWatching: () => request<ContinueWatchingItem[]>('/me/continue-watching'),
  recommendations: () => request<MediaItem[]>('/me/recommendations'),
  recentlyAdded: () => request<MediaItem[]>('/media?sort=createdAt&order=desc'),
  top10: () => request<MediaItem[]>('/home/top'), // 🔜
  featured: () => request<MediaItem[]>('/home/featured'), // 🔜
  series: () => request<MediaItem[]>('/series'),
  musicAlbums: () => request<MediaItem[]>('/music/albums'),

  // Detail / search
  mediaDetail: (id: string) => request<MediaItem>(`/media/${id}`), // 🔜
  search: (q: string) => request<MediaItem[]>(`/media/search?q=${encodeURIComponent(q)}`),

  // Playback
  playback: (id: string) => request<PlaybackInfo>(`/playback/${id}`), // 🔜
  mintStremioKey: () => request<{ key: string }>('/me/stremio-key', { method: 'POST' }),

  // Watch progress
  postWatchEvent: (e: WatchEvent) =>
    request<void>('/watch-events', { method: 'POST', body: e }),
  watchEventsMe: () => request<WatchEvent[]>('/watch-events/me'),
}

export { ApiError } from './http'
export { login, logout, refresh, isAuthenticated, session } from './auth'
export type { MediaItem, ContinueWatchingItem, PlaybackInfo, WatchEvent } from './types'
