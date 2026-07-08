<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../api/client'
import type { WalletStatus, MeshStatus, StorageContributionStatus, StorageQuote } from '../api/client'
import { useSpatialNav } from '../composables/useSpatialNav'
import { storageMarketplaceEnabled } from '../api/flags'

useSpatialNav()

// --- Payments opt-in + wallet (ADR p2p-0020; contract PINNED with mesh-hub 2026-07-07) ---
// Display-only: no money-movement UI ships here (legal #9 open). Default OFF —
// the app is fully functional with payments off. Opt-in is one-way: the pinned
// Hub contract has no opt-out endpoint yet, so once enabled the toggle becomes a
// static indicator rather than a live switch.
const wallet = ref<WalletStatus>({ optedIn: false })
const paymentsLoaded = ref(false)
const paymentsBusy = ref(false)
const paymentsError = ref<string | null>(null)

// --- Mesh availability (read-only; ADR p2p-0008/p2p-0014) ---
const mesh = ref<MeshStatus | null>(null)
const meshError = ref<string | null>(null)

// balanceBaseUnits is a smallest-unit integer string (e.g. USDC has 6 decimals) —
// format it ourselves rather than via float division, which would lose precision.
function formatBalance(raw: string, decimals: number): string {
  let n: bigint
  try {
    n = BigInt(raw)
  } catch {
    return '0'
  }
  const base = 10n ** BigInt(decimals)
  const whole = n / base
  const frac = (n % base).toString().padStart(decimals, '0')
  return `${whole}.${frac}`
}

// Placeholder ETA formatting for the buy-storage quote stub — seam only, not
// wired to any real scheduling data yet (mesh-hub slice-2, tier-placement).
function formatEta(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = seconds / 60
  if (minutes < 60) return `~${Math.round(minutes)} min`
  const hours = minutes / 60
  if (hours < 24) return `~${Math.round(hours)} hr`
  return `~${Math.round(hours / 24)} day${Math.round(hours / 24) === 1 ? '' : 's'}`
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let v = n / 1024
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(1)} ${units[i]}`
}

onMounted(async () => {
  // wallet/mesh are 🔜 Hub gaps as of this build — fail closed to the opted-out,
  // no-wallet default so the settings page never breaks without a backend.
  try {
    wallet.value = await api.wallet()
  } catch {
    wallet.value = { optedIn: false }
  } finally {
    paymentsLoaded.value = true
  }

  try {
    mesh.value = await api.meshStatus()
  } catch {
    meshError.value = 'Mesh status isn’t available yet — backend not connected.'
  }
})

async function enablePayments() {
  if (paymentsBusy.value || wallet.value.optedIn) return
  paymentsError.value = null
  paymentsBusy.value = true

  try {
    await api.walletOptIn()
    // opt-in response omits the balance — re-fetch full status for that.
    wallet.value = await api.wallet()
  } catch {
    paymentsError.value = 'Payments aren’t available yet — coming soon.'
  } finally {
    paymentsBusy.value = false
  }
}

// --- Storage marketplace: contribution opt-in + buy-storage stub (ADR p2p-0022) ---
// Flag-gated (storageMarketplaceEnabled) and rides on the same wallet as the
// base payments opt-in above, so it only shows once wallet.optedIn is true.
// Seam only — the "quote" is a placeholder, no settlement happens here.
const contribution = ref<StorageContributionStatus>({ contributing: false })
const contributionBusy = ref(false)
const contributionError = ref<string | null>(null)
const additionalGbInput = ref('')
const priceInput = ref('')

const quoteGbInput = ref('')
const quote = ref<StorageQuote | null>(null)
const quoteBusy = ref(false)
const quoteError = ref<string | null>(null)

onMounted(async () => {
  if (!storageMarketplaceEnabled) return
  try {
    contribution.value = await api.storageContribution()
  } catch {
    contribution.value = { contributing: false }
  }
})

async function submitContribution() {
  if (contributionBusy.value || contribution.value.contributing) return
  const additionalGb = Number(additionalGbInput.value)
  const pricePerGbCents = Number(priceInput.value)
  if (
    !Number.isFinite(additionalGb) ||
    additionalGb <= 0 ||
    !Number.isFinite(pricePerGbCents) ||
    pricePerGbCents <= 0
  ) {
    contributionError.value = 'Enter a positive GB amount and price.'
    return
  }

  contributionError.value = null
  contributionBusy.value = true
  try {
    contribution.value = await api.storageContributionOptIn({ additionalGb, pricePerGbCents })
  } catch {
    contributionError.value = 'Storage contribution isn’t available yet — coming soon.'
  } finally {
    contributionBusy.value = false
  }
}

async function getQuote() {
  if (quoteBusy.value) return
  const requestedGb = Number(quoteGbInput.value)
  if (!Number.isFinite(requestedGb) || requestedGb <= 0) {
    quoteError.value = 'Enter a positive GB amount.'
    return
  }

  quoteError.value = null
  quote.value = null
  quoteBusy.value = true
  try {
    quote.value = await api.storageQuote({ requestedGb })
  } catch {
    quoteError.value = 'Quotes aren’t available yet — coming soon.'
  } finally {
    quoteBusy.value = false
  }
}
</script>

<template>
  <div class="px-5 md:px-content-x py-6 md:py-content-y max-w-2xl space-y-section">
    <h1 class="text-2xl font-semibold tracking-tight">Settings</h1>

    <!-- Payments opt-in + wallet -->
    <section class="bg-surface rounded-large px-5 md:px-content-x py-6 space-y-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-semibold tracking-tight mb-1">Payments</h2>
          <p class="text-sm text-muted max-w-md">
            Optionally let peers pay you for priority bandwidth. Off by default —
            this screen only displays your wallet, it never sends or moves funds.
          </p>
        </div>
        <button
          data-nav
          type="button"
          role="switch"
          :aria-checked="wallet.optedIn"
          aria-label="Enable payments"
          :disabled="paymentsBusy || wallet.optedIn"
          class="shrink-0 w-12 h-7 rounded-full relative transition-colors disabled:opacity-50"
          :class="wallet.optedIn ? 'bg-accent' : 'bg-white/15'"
          @click="enablePayments"
        >
          <span
            class="absolute top-0.5 left-0.5 size-6 rounded-full bg-white transition-transform"
            :class="wallet.optedIn ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

      <p v-if="paymentsError" class="text-accent text-sm" role="alert">
        {{ paymentsError }}
      </p>
      <p v-else-if="wallet.optedIn" class="text-xs text-muted">
        Opting out isn’t available from here yet.
      </p>

      <div v-if="wallet.optedIn" class="rounded-card bg-app px-4 py-4 space-y-2">
        <div class="text-xs text-muted uppercase tracking-wide mb-1">Wallet address</div>
        <div class="font-mono text-sm text-soft break-all">{{ wallet.address }}</div>
        <div class="mt-3 text-xs text-muted uppercase tracking-wide mb-1">
          {{ wallet.asset }} balance
        </div>
        <div class="text-lg font-semibold">
          {{ formatBalance(wallet.balanceBaseUnits, wallet.decimals) }} {{ wallet.asset }}
        </div>
      </div>
      <p v-else-if="paymentsLoaded" class="text-sm text-muted">Not enabled.</p>
    </section>

    <!-- Storage marketplace — contribution opt-in + buy-storage stub (seam only) -->
    <section
      v-if="storageMarketplaceEnabled && wallet.optedIn"
      class="bg-surface rounded-large px-5 md:px-content-x py-6 space-y-4"
    >
      <div>
        <h2 class="text-xl font-semibold tracking-tight mb-1">Storage marketplace</h2>
        <p class="text-sm text-muted max-w-md">
          Dedicate additional storage to the mesh at a price you set, or request
          storage from peers. Seam only — no real settlement happens yet.
        </p>
      </div>

      <div class="rounded-card bg-app px-4 py-4 space-y-3">
        <h3 class="text-sm font-semibold">Contribute additional storage</h3>
        <p v-if="contribution.contributing" class="text-sm text-soft">
          Contributing {{ contribution.additionalGb }} GB at
          {{ ((contribution.pricePerGbCents ?? 0) / 100).toFixed(2) }} USDC/GB.
        </p>
        <form v-else class="flex flex-wrap items-end gap-3" @submit.prevent="submitContribution">
          <label class="flex flex-col gap-1 text-xs text-muted">
            Additional GB
            <input
              v-model="additionalGbInput"
              data-nav
              type="number"
              min="1"
              step="1"
              class="w-28 bg-page text-fg placeholder:text-muted rounded-card px-3 py-2"
            />
          </label>
          <label class="flex flex-col gap-1 text-xs text-muted">
            Price (¢/GB)
            <input
              v-model="priceInput"
              data-nav
              type="number"
              min="1"
              step="1"
              class="w-28 bg-page text-fg placeholder:text-muted rounded-card px-3 py-2"
            />
          </label>
          <button
            data-nav
            type="submit"
            :disabled="contributionBusy"
            class="bg-accent text-fg rounded-full px-4 py-2 font-medium transition-opacity disabled:opacity-50"
          >
            {{ contributionBusy ? 'Saving…' : 'Start contributing' }}
          </button>
        </form>
        <p v-if="contributionError" class="text-accent text-sm" role="alert">
          {{ contributionError }}
        </p>
      </div>

      <div class="rounded-card bg-app px-4 py-4 space-y-3">
        <h3 class="text-sm font-semibold">Buy storage</h3>
        <form class="flex flex-wrap items-end gap-3" @submit.prevent="getQuote">
          <label class="flex flex-col gap-1 text-xs text-muted">
            Requested GB
            <input
              v-model="quoteGbInput"
              data-nav
              type="number"
              min="1"
              step="1"
              class="w-28 bg-page text-fg placeholder:text-muted rounded-card px-3 py-2"
            />
          </label>
          <button
            data-nav
            type="submit"
            :disabled="quoteBusy"
            class="bg-fg/95 text-page rounded-full px-4 py-2 font-medium transition-opacity disabled:opacity-50"
          >
            {{ quoteBusy ? 'Getting quote…' : 'Get quote' }}
          </button>
        </form>
        <p v-if="quoteError" class="text-accent text-sm" role="alert">{{ quoteError }}</p>
        <p v-else-if="quote" class="text-sm text-soft">
          Estimated quote: {{ (quote.estimatedPriceCents / 100).toFixed(2) }}
          {{ quote.currency }} for {{ quote.requestedGb }} GB, ready in
          {{ formatEta(quote.estimatedEtaSeconds) }} — placeholder only, no
          settlement occurs.
        </p>
      </div>
    </section>

    <!-- Mesh status -->
    <section class="bg-surface rounded-large px-5 md:px-content-x py-6 space-y-3">
      <h2 class="text-xl font-semibold tracking-tight">Mesh status</h2>
      <p v-if="meshError" class="text-sm text-muted">{{ meshError }}</p>
      <div v-else-if="mesh" class="grid grid-cols-3 gap-4 text-center">
        <div>
          <div class="text-lg font-semibold" :class="mesh.online ? 'text-fg' : 'text-muted'">
            {{ mesh.online ? 'Online' : 'Offline' }}
          </div>
          <div class="text-xs text-muted mt-1">Status</div>
        </div>
        <div>
          <div class="text-lg font-semibold">{{ mesh.peerCount }}</div>
          <div class="text-xs text-muted mt-1">Peers</div>
        </div>
        <div>
          <div class="text-lg font-semibold">{{ formatBytes(mesh.sharedBytes) }}</div>
          <div class="text-xs text-muted mt-1">Shared</div>
        </div>
      </div>
      <p v-else class="text-sm text-muted">Loading mesh status…</p>
    </section>
  </div>
</template>
