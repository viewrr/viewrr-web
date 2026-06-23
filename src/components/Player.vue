<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CATALOG } from '../data/catalog'
import type { Title } from '../types'

const props = defineProps<{ id: string }>()
const router = useRouter()

const title = computed<Title | undefined>(() =>
  CATALOG.find((t) => t.id === props.id),
)

// No real playback yet (#106 step 3 wires the HLS stream). These drive the
// chrome only: a play/pause toggle and a static scrubber position so the
// accent fill is visible.
const DURATION_SECONDS = 108 * 60 // matches the 1h48m metadata stub on Detail

const playing = ref(true)
const progress = ref(34) // percent, 0–100

const elapsed = computed(() => fmt((progress.value / 100) * DURATION_SECONDS))
const remaining = computed(
  () => '-' + fmt(DURATION_SECONDS - (progress.value / 100) * DURATION_SECONDS),
)

function fmt(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m)
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

function togglePlay() {
  playing.value = !playing.value
}

function seekRelative(deltaSeconds: number) {
  const deltaPct = (deltaSeconds / DURATION_SECONDS) * 100
  progress.value = clamp(progress.value + deltaPct, 0, 100)
}

function onScrub(event: Event) {
  const target = event.target as HTMLInputElement
  progress.value = clamp(Number(target.value), 0, 100)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function goBack() {
  // Prefer real history; fall back to this title's detail page when the
  // player was reached directly (e.g. deep link / refresh).
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push(`/title/${props.id}`)
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black text-fg select-none">
    <!-- Backdrop as video placeholder (no real stream yet). -->
    <img
      v-if="title"
      :src="title.backdrop ?? ''"
      :alt="title.title"
      class="absolute inset-0 h-full w-full object-cover"
    />
    <div class="absolute inset-0 bg-black/35"></div>
    <!-- Top + bottom scrims so chrome stays legible over any frame. -->
    <div class="player-scrim-top absolute inset-x-0 top-0 h-40"></div>
    <div class="player-scrim-bottom absolute inset-x-0 bottom-0 h-56"></div>

    <!-- TOP CHROME: back + title -->
    <header
      class="absolute inset-x-0 top-0 flex items-center gap-4 px-content-x py-6"
    >
      <button
        type="button"
        aria-label="Back"
        class="inline-flex h-11 w-11 items-center justify-center rounded-full glass text-fg transition-transform duration-200 hover:scale-105 focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        @click="goBack"
      >
        <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" aria-hidden="true">
          <path
            d="M15 5l-7 7 7 7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <h1 class="text-lg font-semibold">
        {{ title ? title.title : 'Unknown title' }}
      </h1>
    </header>

    <!-- BOTTOM CHROME: scrubber + transport + secondary controls -->
    <footer class="absolute inset-x-0 bottom-0 px-content-x pb-10 space-y-5">
      <!-- Scrubber with accent fill -->
      <div class="flex items-center gap-3 text-xs tabular-nums text-soft">
        <span class="w-12 text-right">{{ elapsed }}</span>
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          :value="progress"
          aria-label="Seek"
          class="scrubber flex-1"
          :style="{ '--pct': progress + '%' }"
          @input="onScrub"
        />
        <span class="w-12">{{ remaining }}</span>
      </div>

      <!-- Controls: transport centered, secondary controls trailing -->
      <div class="flex items-center">
        <div class="flex flex-1 items-center justify-center gap-8">
          <!-- back 10s -->
          <button
            type="button"
            aria-label="Back 10 seconds"
            class="ctrl"
            @click="seekRelative(-10)"
          >
            <svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" aria-hidden="true">
              <path
                d="M11 6V2L6 6l5 4V7a6 6 0 11-6 6"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <text x="12" y="16" text-anchor="middle" font-size="7" fill="currentColor">10</text>
            </svg>
          </button>

          <!-- play / pause -->
          <button
            type="button"
            :aria-label="playing ? 'Pause' : 'Play'"
            class="ctrl"
            @click="togglePlay"
          >
            <svg v-if="playing" viewBox="0 0 24 24" class="h-9 w-9" fill="currentColor" aria-hidden="true">
              <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
            </svg>
            <svg v-else viewBox="0 0 24 24" class="h-9 w-9" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          <!-- forward 10s -->
          <button
            type="button"
            aria-label="Forward 10 seconds"
            class="ctrl"
            @click="seekRelative(10)"
          >
            <svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" aria-hidden="true">
              <path
                d="M13 6V2l5 4-5 4V7a6 6 0 106 6"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <text x="12" y="16" text-anchor="middle" font-size="7" fill="currentColor">10</text>
            </svg>
          </button>
        </div>

        <!-- secondary controls: CC / volume / AirPlay -->
        <div class="flex items-center gap-6">
          <button type="button" aria-label="Subtitles" class="ctrl">
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.8" />
              <path d="M7 13h3M13 13h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>

          <button type="button" aria-label="Volume" class="ctrl">
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
              <path d="M16 8a5 5 0 010 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>

          <button type="button" aria-label="AirPlay" class="ctrl">
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" aria-hidden="true">
              <path d="M5 17H4a1 1 0 01-1-1V6a1 1 0 011-1h16a1 1 0 011 1v10a1 1 0 01-1 1h-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M12 14l5 6H7l5-6z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.player-scrim-top {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0));
}
.player-scrim-bottom {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
}

.ctrl {
  color: var(--color-fg);
  transition: transform 0.2s var(--ease-tv), opacity 0.2s;
  opacity: 0.92;
}
.ctrl:hover,
.ctrl:focus-visible {
  transform: scale(1.12);
  opacity: 1;
  outline: none;
}
.ctrl:focus-visible {
  border-radius: 9999px;
  box-shadow: 0 0 0 2px var(--color-focus);
}

/* Scrubber: accent fill up to --pct, faint track after. */
.scrubber {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 9999px;
  background: linear-gradient(
    to right,
    var(--color-accent) 0%,
    var(--color-accent) var(--pct),
    rgba(255, 255, 255, 0.25) var(--pct),
    rgba(255, 255, 255, 0.25) 100%
  );
  cursor: pointer;
}
.scrubber::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  background: var(--color-fg);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}
.scrubber::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: none;
  border-radius: 9999px;
  background: var(--color-fg);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}
.scrubber:focus-visible {
  outline: none;
}
.scrubber:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px var(--color-focus);
}
.scrubber:focus-visible::-moz-range-thumb {
  box-shadow: 0 0 0 3px var(--color-focus);
}
</style>
