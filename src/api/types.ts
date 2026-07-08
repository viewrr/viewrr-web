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

// Payments — opt-in, display-only wallet (ADR p2p-0020; docs/pay/2-seed-derived-evm-wallet-l2-client.md).
// Non-custodial: the Hub derives the wallet from the account's seed on opt-in and
// never exposes signing here. No money-movement fields belong on this type (legal #9).
// Contract PINNED with mesh-hub (2026-07-07):
//   POST /api/pay/wallet/opt-in -> WalletOptInResponse (idempotent)
//   GET  /api/pay/wallet        -> WalletStatus
// There is no opt-out endpoint yet — opt-in is one-way from the client's perspective.
export interface WalletOptInResponse {
  address: string
  optedIn: true
}

export type WalletStatus =
  | { optedIn: false }
  | {
      optedIn: true
      address: string
      // Smallest-unit integer as a decimal string — never a float, to avoid
      // precision loss. Format client-side using `decimals` (see settings.vue).
      balanceBaseUnits: string
      asset: string // e.g. "USDC"
      decimals: number // e.g. 6
    }

// Mesh availability — read-only peer/seeding status for the account (ADR p2p-0008 /
// p2p-0014). Contract is provisional; coordinate with mesh-hub before the Hub lands it.
export interface MeshStatus {
  online: boolean
  peerCount: number
  sharedBytes: number
}

// Storage marketplace — contribution opt-in (ADR p2p-0022, storage-escrow).
// Dedicate ADDITIONAL storage beyond the base payments wallet, at a price the
// user sets. Rides on the same wallet as payments opt-in (settings.vue only
// shows this once `wallet.optedIn`). Contract provisional — pay-go/mesh-hub
// haven't landed the Hub route yet (seam only, behind storageMarketplaceEnabled).
export interface StorageContributionStatus {
  contributing: boolean
  additionalGb?: number
  pricePerGbCents?: number
}

export interface StorageContributionRequest {
  additionalGb: number
  pricePerGbCents: number
}

// "Buy storage" surface — seam only. Returns a placeholder quote; no real
// settlement happens anywhere in this client (legal #9 still open).
export interface StorageQuoteRequest {
  requestedGb: number
}

export interface StorageQuote {
  requestedGb: number
  estimatedPriceCents: number
  currency: string
  // Placeholder ETA for provisioning the requested storage — seam only, not a
  // real scheduling signal until mesh-hub's tier-placement config lands.
  estimatedEtaSeconds: number
}
