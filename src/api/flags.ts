// Client feature flags. Env var sets the default — unset/false ⇒ off, keeping
// the app byte-identical to today until a slice's backend contract lands
// (mirrors the VITE_OIDC_ISSUER gate in oidc.ts). A localStorage override lets
// Playwright (and manual dogfooding) flip a flag on without touching env/build
// config, since some gated slices still need on-path e2e coverage.
function flag(envValue: string | undefined, overrideKey: string): boolean {
  const override = typeof localStorage !== 'undefined' ? localStorage.getItem(overrideKey) : null
  if (override !== null) return override === 'true' || override === '1'
  return envValue === 'true' || envValue === '1'
}

// Storage marketplace opt-in (dedicate additional GB at a set price) +
// buy-storage quote stub (ADR p2p-0022). 🔜 pay-go/mesh-hub: no Hub route yet.
export const storageMarketplaceEnabled = flag(
  import.meta.env.VITE_FEATURE_STORAGE_MARKETPLACE as string | undefined,
  'ff.storageMarketplace',
)
