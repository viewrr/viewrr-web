# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — the Viewer.** Someone watching movies and shows, at a 10-foot TV
with a remote/D-pad or in a web browser. Their job is: find something and watch
it, with as little friction as possible.

**Secondary — the Contributor.** A minority of users who opt into sharing
bandwidth/storage to help run the network (and optionally earn). This is an
opt-in role layered onto the viewer experience, never a prerequisite for
watching.

## Product Purpose

viewrr is a streaming client for a peer-to-peer mesh network: browse and watch
movies and shows (a music surface also exists) delivered over a decentralized
peer network instead of a single provider's CDN. Success is a viewer watching
effortlessly and never having to think about how delivery works.

## Positioning

The decentralized delivery is **invisible plumbing**. The experience matches any
premium streaming app; the mesh and wallet are a deliberately backgrounded,
opt-in capability in Settings, not the headline. Decentralization is the *how*,
not the pitch — the product is judged as a streaming app first.

## Operating Context

- Two runtimes for one design language: 10-foot TV with remote/D-pad, and the
  web browser. Every primary flow must work by remote/keyboard, not just pointer.
- OIDC sign-in (`oidc-client-ts`); HLS playback (`hls.js`).
- Optional P2P layer: a wallet (USDC, seeded via BIP-39) and a storage
  marketplace, both gated and opt-in, reached only through Settings.

## Capabilities and Constraints

- Browse home shelves (Continue Watching, Top 10, Recommended, Recently Added,
  Featured), title detail, and a full-screen player with remote transport
  (play/pause, ±10s seek, mute). Search and Movies/Shows/Music sections exist.
- Backed by the real viewrr Hub API (OpenAPI spec at
  `docs.viewrr.stream/openapi.yaml`); a mock catalog with real TMDB art
  (`src/data/catalog.ts`) provides the instant first paint and the offline/no-
  backend fallback.
- **Payments opt-in is currently one-way**: the pinned Hub contract (ADR
  p2p-0020) has no opt-out endpoint yet, so the UI must state this before a user
  opts in rather than promise a toggle it cannot deliver.
- The storage marketplace is flag-gated and preview-only — no real settlement
  occurs yet; copy must not imply a purchase happens.

## Brand Commitments

- Name: **viewrr**.
- Voice: plain, calm, honest — no jargon leaking into user-facing copy; controls
  name their action; unavailable features say so plainly.
- The **Apple-TV visual language is binding** (see DESIGN.md): dark calm
  surfaces, content-is-the-UI, physical focus (scale + white ring on the rounded
  poster), a single accent `#ff5470` used sparingly, system SF type. This is a
  hard commitment, not merely the current state.

## Evidence on Hand

- Mock catalog with real TMDB poster/backdrop art (`src/data/catalog.ts`) — used
  as first paint and fallback, not as a content claim.
- DESIGN.md + `design/index.html` + `design/tokens.css` — the canonical visual
  reference and extracted tokens.
- No real testimonials, customer names, benchmarks, pricing, or subscriber
  numbers exist yet; future work must not fabricate them.

## Product Principles

1. **Viewer first.** Browse → watch is the spine of the product; contribution is
   a quiet opt-in that never gets in a watcher's way.
2. **The mesh is invisible plumbing.** Never make decentralization the viewer's
   problem; surface it only where a user deliberately goes looking (Settings).
3. **Operable by remote and keyboard.** 10-foot spatial navigation and visible
   focus are requirements, not enhancements — the pointer is one input, not the
   only one.
4. **Content is the UI.** Real art fills the frame; chrome stays out of the way,
   per the binding Apple-TV language.
5. **Parity with mobile.** Web and the Compose Multiplatform app share the same
   design tokens (ADR-0005); a token is changed in one place, honored in both.

## Accessibility & Inclusion

Full operability by D-pad/remote and keyboard is required, not optional: every
interactive control is reachable and activatable without a pointer, spatial
navigation drives focus between content cards, and focus is always visibly
indicated on dark surfaces. Player transport (play/pause, seek, mute) must be
reachable the same way.
