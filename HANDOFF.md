# viewrr-web — Agent Handoff

You are picking up the **viewrr web + TV client**. This doc is your cold-start. Read it
top to bottom, then DESIGN.md, then open `design/index.html`.

## What viewrr is
Self-hosted FOSS OTT platform (Jellyfin alternative). Backend: Kotlin/Ktor, repo
[`viewrr/viewrr`](https://github.com/viewrr/viewrr). It is becoming a distributed
Hub/Node system, but **clients only ever talk to the Hub's API** — you can ignore the
Node/distributed internals.

## Your mission
A first-party **web + TV** client. **Vue 3 + Vite**, **Tailwind CSS + Tailwind Plus**,
in the **Apple-TV design language**. This is greenfield — no fork.

## Start here (in this repo)
- **DESIGN.md** — the design system: principles, tokens, component inventory.
- **design/index.html** + **design/data.js** — the canonical Apple-TV mock (real TMDB art). Open it; build to match it.
- **design/tokens.css** / **design/tokens.json** — color/radius/type/space/media/motion. First scaffold task: map `tokens.json` → `tailwind.config` theme.

## Issues (milestone [Phase 19: Clients](https://github.com/viewrr/viewrr/milestone/18))
- **#103** scaffold Vue 3 + Vite + Tailwind + Tailwind Plus; tokens → theme.
- **#104** viewrr API client + auth.
- **#106** screens: home (shelves + Top-10 + featured) + detail + player.
- **#107** TV 10-foot layout + focus navigation (D-pad/remote).

## Decisions of record (do not relitigate)
- **Design language = Apple TV.** Top nav (not sidebar). Focus = scale 1.06 + white ring on the rounded poster, `cubic-bezier(.2,.7,.2,1)` .25s. Player icons are clean SVG, never emoji. See [ADR-0005](https://github.com/viewrr/viewrr/blob/main/docs/adr/0005-client-stack.md).
- **Protocol = viewrr's OWN API, NOT the Jellyfin API.** (Why this client is greenfield, not a Jellyfin-client fork.)

## Auth
- **Humans** authenticate via **Keycloak** (OIDC — Google OAuth, passkeys, SSO). The web app is an OIDC client; validate/refresh Keycloak tokens. (Server currently still has a legacy JWT `/auth/login`; it is being migrated to Keycloak — coordinate, see below.)
- **Playback devices** use a **per-device stremio-key** (long-lived, in the stream URL path), minted by an authenticated session. TVs can't OAuth.

## API contract — COORDINATE WITH BACKEND AGENT
The server's client-facing REST API is **not yet finalized** — today the server exposes a
Stremio addon (`/stremio/{key}/catalog|meta|stream`), HLS stream routes
(`/stream/k/{key}/{id}/playlist.m3u8`), `/auth/*`, and assorted REST. A clean client API
(catalog, detail, search, continue-watching, playback URL, auth) is the **backend agent's**
deliverable. **Do not invent the API silently** — read the server routes in
`viewrr/viewrr` (`server/src/main/kotlin/**/*Routes.kt`), and where a needed endpoint is
missing, file an issue against `viewrr/viewrr` tagging the backend. Build screens against a
thin typed API layer + mock data so you're not blocked.

## Suggested first steps
1. #103: `npm create vite@latest` (Vue+TS), add Tailwind + Tailwind Plus, port `tokens.json` into `tailwind.config`.
2. Build **Shelf** + **PosterCard** + **Top10Card** from the mock; render `design/data.js` data.
3. Stub the API layer (typed, mock responses) → wire to real endpoints as the backend API lands.

## Pointers
- Glossary: [`viewrr/viewrr` CONTEXT.md](https://github.com/viewrr/viewrr/blob/main/CONTEXT.md). Wiki: repo wiki (Serving / Network pages explain stremio-key + locality).
- Sibling client: `viewrr/viewrr-mobile` (Compose Multiplatform) shares the same design tokens — keep visual parity.
