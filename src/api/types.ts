// Types mirror docs/api/client-api.md (v0 contract) in viewrr/viewrr.
// Fields the contract marks nullable are `| null`; fields not on every row are optional.

export interface MediaItem {
  id: string
  title: string
  cleanTitle?: string
  showTitle?: string
  season?: number
  episode?: number
  year?: number
  poster: string | null
  backdrop: string | null
  overview?: string | null
  durationSecs?: number
  contentRating?: string
  genres?: string[] // not in v0 contract yet; rendered when the API adds it
}

export interface ContinueWatchingItem extends MediaItem {
  positionSecs: number
}

export interface PlaybackInfo {
  url: string
  type: 'hls'
  drm: null
  subtitles: { lang: string; url: string }[]
  startPositionSecs: number
}

export type WatchEventType = 'start' | 'progress' | 'pause' | 'stop'

export interface WatchEvent {
  mediaId: string
  positionSecs: number
  eventType: WatchEventType
  sessionId: string
}

export interface AuthTokens {
  token: string
  refreshToken?: string
}
