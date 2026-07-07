# Payments opt-in + mesh status — web slice notes (task #4)

## What shipped
- `src/pages/settings.vue` — new `/settings` route: Payments panel (opt-in toggle,
  default OFF, wallet address + USDC balance display-only) + Mesh status panel
  (peer count, online, shared bytes — read-only).
- `src/api/types.ts` / `src/api/client.ts` — added `PaymentsStatus`, `WalletInfo`,
  `MeshStatus` types + `paymentsStatus`, `enablePayments`, `disablePayments`,
  `wallet`, `meshStatus` methods on the existing `api` object (no new HTTP layer).
- `src/components/TopNav.vue` — account button now routes to `/settings` when
  authenticated, `/login` otherwise.
- `tests/settings.spec.ts` — Playwright smoke: panel renders opted-out by default,
  no USDC/wallet text shows while off, no send/withdraw/pay controls anywhere.

## API contract — PINNED with mesh-hub (2026-07-07)
Wallet endpoints below are final (mesh-hub is implementing them); mesh status is
still provisional/🔜.

| Method | Path | Returns |
|---|---|---|
| POST | `/api/pay/wallet/opt-in` | `{ address, optedIn: true }` — idempotent, no balance |
| GET | `/api/pay/wallet` | opted in: `{ address, balanceBaseUnits, asset, decimals, optedIn: true }`; not opted in: `{ optedIn: false }` |
| GET | `/me/mesh` | 🔜 provisional — `{ online, peerCount, sharedBytes }` — per-account mesh availability |

No opt-out endpoint is defined yet, so `settings.vue`'s toggle is one-way: once
`wallet.optedIn` is true the switch disables itself and shows a static "opting out
isn't available yet" note instead of reverting.

## Design notes / constraints honored
- Read-only: no send/withdraw/pay control exists anywhere on the page (legal #9 gate).
- Opt-in default OFF; page and app work fully with payments off and Hub unreachable
  (all calls degrade gracefully, matching the existing mock-fallback pattern in
  `index.vue`/`search.vue`).
- `balanceBaseUnits` formatted client-side via BigInt math (never float) using the
  API-supplied `decimals`/`asset` — no more hardcoded USDC/6-decimal assumption.
- Reused `src/api/http.ts`'s `request()` — no new fetch/HTTP code.

## Open questions for mesh-hub
- Confirm `/me/mesh` shape — is per-account "sharedBytes" the right metric, or does
  mesh-hub track something more like active-swarm-count / seeding-titles instead?
- Confirm whether payments opt-in/wallet endpoints live on the Hub (Kotlin) or are
  proxied from the Go pay service (`p2p-0022`) — affects base URL / auth header.
- Whether/when an opt-out endpoint lands — client currently has no way to reverse
  opt-in once the Hub confirms it.
