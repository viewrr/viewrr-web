<route>
{ "props": true }
</route>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../api/client'
import { API_BASE } from '../../api/config'
import { CATALOG } from '../../data/catalog'
import type { Title } from '../../types'
import type { WatchEventType } from '../../api/types'

const props = defineProps<{ id: string }>()
const router = useRouter()

// Real title from /media/{id}; mock fallback for the instant first paint.
const title = ref<Title | undefined>(CATALOG.find((t) => t.id === props.id))
api.mediaDetail(props.id).then((m) => (title.value = m)).catch(() => {})

const video = ref<HTMLVideoElement | null>(null)
const hasVideo = ref(false) // true once a real stream is attached

// Real playback state when a stream is attached; otherwise these drive the
// demo chrome (so the player still looks alive without a backend).
const DEMO_DURATION = 108 * 60
const playing = ref(true)
const currentSecs = ref(0)
const durationSecs = ref(DEMO_DURATION)
const demoProgress = ref(34) // percent, used only in demo mode

const progress = computed(() =>
  hasVideo.value
    ? durationSecs.value
      ? (currentSecs.value / durationSecs.value) * 100
      : 0
    : demoProgress.value,
)
const elapsed = computed(() =>
  fmt(hasVideo.value ? currentSecs.value : (demoProgress.value / 100) * DEMO_DURATION),
)
const remaining = computed(() => {
  const dur = hasVideo.value ? durationSecs.value : DEMO_DURATION
  const cur = hasVideo.value ? currentSecs.value : (demoProgress.value / 100) * DEMO_DURATION
  return '-' + fmt(dur - cur)
})

function fmt(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m)
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

// --- Watch progress (#104 /watch-events): best-effort, never blocks playback ---
const sessionId =
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `s-${props.id}`
let lastReport = 0
function report(eventType: WatchEventType) {
  api
    .postWatchEvent({
      mediaId: props.id,
      positionSecs: Math.round(currentSecs.value),
      eventType,
      sessionId,
    })
    .catch(() => {})
}

// --- Stream resolution: /playback/{id} → stremio-key HLS → demo fallback ---
let hls: { destroy(): void } | null = null // hls.js instance, loaded on demand

async function resolveSrc(): Promise<{ url: string; start: number } | null> {
  try {
    const pb = await api.playback(props.id)
    return { url: pb.url, start: pb.startPositionSecs ?? 0 }
  } catch {
    // The one playback endpoint isn't live yet (Phase-20 gap) — try the
    // device stremio-key flow the server already exposes.
    try {
      const { key } = await api.mintStremioKey()
      return { url: `${API_BASE}/stream/k/${key}/${props.id}/playlist.m3u8`, start: 0 }
    } catch {
      return null // no backend → demo chrome
    }
  }
}

async function attach(el: HTMLVideoElement, url: string, start: number) {
  // hls.js first: it works everywhere except Safari. Chrome's native
  // canPlayType('…mpegurl') can falsely report "maybe" but can't actually
  // play HLS — so only fall back to native when MSE/hls.js is unavailable.
  const { default: Hls } = await import('hls.js')
  if (Hls.isSupported()) {
    const inst = new Hls()
    hls = inst
    inst.on(Hls.Events.ERROR, (_e, data) => {
      if (!data.fatal) return
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) inst.startLoad()
      else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) inst.recoverMediaError()
      else inst.destroy()
    })
    inst.attachMedia(el)
    inst.loadSource(url)
  } else {
    el.src = url // Safari (native HLS) or last resort
  }
  if (start > 0) el.currentTime = start
  el.play().catch(() => {})
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' || e.key === 'Backspace') goBack()
}

onMounted(async () => {
  window.addEventListener('keydown', onKey)
  const src = await resolveSrc()
  const el = video.value
  if (!src || !el) return // demo mode
  hasVideo.value = true
  el.addEventListener('timeupdate', () => {
    currentSecs.value = el.currentTime
    if (el.currentTime - lastReport >= 15) {
      lastReport = el.currentTime
      report('progress')
    }
  })
  el.addEventListener('durationchange', () => (durationSecs.value = el.duration || 0))
  el.addEventListener('play', () => {
    playing.value = true
    report('start')
  })
  el.addEventListener('pause', () => {
    playing.value = false
    report('pause')
  })
  attach(el, src.url, src.start)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (hasVideo.value) report('stop')
  hls?.destroy()
})

function togglePlay() {
  const el = video.value
  if (hasVideo.value && el) {
    el.paused ? el.play().catch(() => {}) : el.pause()
  } else {
    playing.value = !playing.value
  }
}

function seekRelative(deltaSeconds: number) {
  const el = video.value
  if (hasVideo.value && el) {
    el.currentTime = clamp(el.currentTime + deltaSeconds, 0, durationSecs.value || el.currentTime)
  } else {
    const deltaPct = (deltaSeconds / DEMO_DURATION) * 100
    demoProgress.value = clamp(demoProgress.value + deltaPct, 0, 100)
  }
}

function onScrub(event: Event) {
  const pct = clamp(Number((event.target as HTMLInputElement).value), 0, 100)
  const el = video.value
  if (hasVideo.value && el && durationSecs.value) {
    el.currentTime = (pct / 100) * durationSecs.value
  } else {
    demoProgress.value = pct
  }
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
    <!-- Real stream when resolved; backdrop poster behind it as the first paint
         and the fallback when no stream is available. -->
    <video
      ref="video"
      class="absolute inset-0 h-full w-full object-contain bg-black"
      :poster="title?.backdrop ?? ''"
      playsinline
      autoplay
      muted
      @click="togglePlay"
    ></video>
    <img
      v-if="!hasVideo && title"
      :src="title.backdrop ?? ''"
      :alt="title.title"
      class="absolute inset-0 h-full w-full object-cover"
    />
    <div class="absolute inset-0 bg-black/35" :class="{ 'pointer-events-none': hasVideo }"></div>
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
