// Types mirror docs.viewrr.stream/openapi.yaml (the source of truth).
// Fields nullable per spec; only id+title are guaranteed on MediaItem.

export interface MediaItem {
  id: string
  title: string
  cleanTitle?: string | null
  showTitle?: string | null
  seasonNumber?: number | null
  episodeNumber?: number | null
  year?: number | null
  durationSecs?: number | null
  hlsPath?: string | null
  contentRating?: string | null
  poster: string | null
  backdrop: string | null
  overview?: string | null
  // Not in the v0 API; kept optional so genre UI degrades to a placeholder.
  genres?: string[]
}

export interface ContinueWatchingItem {
  mediaId: string
  title: string
  hlsPath?: string | null
  durationSecs?: number | null
  positionSecs: number
  percent: number // 0–100
}

export interface Recommendation {
  mediaId: string
  title: string
  hlsPath?: string | null
  score: number
  rank: number
}

export interface Album {
  album: string
  trackCount: number
  artist: string
}

export interface ShowView {
  showTitle: string
  episodeCount: number
  seasonCount: number
}

export interface PlaybackInfo {
  url: string
  type: string
  startPositionSecs: number
  subtitlesUrl: string
  trickplayUrl: string
}

export type WatchEventType = 'start' | 'progress' | 'pause' | 'stop'

export interface WatchEvent {
  mediaId: string
  positionSecs: number
  eventType: WatchEventType
  sessionId: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}
