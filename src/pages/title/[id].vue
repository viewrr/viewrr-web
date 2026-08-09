<route>
{ "props": true }
</route>

<script setup lang="ts">
import { ref, computed, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../api/client'
import { CATALOG, GENRES } from '../../data/catalog'
import type { Title } from '../../types'
import Shelf from '../../components/Shelf.vue'
import PosterCard from '../../components/PosterCard.vue'

const props = defineProps<{ id: string }>()
const router = useRouter()

// Fetch real detail from /media/{id}; fall back to mock when the Hub is down or
// the endpoint is still a Phase-20 gap. mock find is the instant first paint.
const title = ref<Title | undefined>(CATALOG.find((t) => t.id === props.id))
watchEffect(async () => {
  try {
    title.value = await api.mediaDetail(props.id)
  } catch {
    title.value = CATALOG.find((t) => t.id === props.id)
  }
})

// Real genre when the item carries one; stable placeholder from id otherwise.
const stubGenre = computed(() => {
  if (title.value?.genres?.length) return title.value.genres[0]
  const n = Number(props.id)
  const idx = Number.isFinite(n) ? Math.abs(n) % GENRES.length : 0
  return GENRES[idx]
})

const runtime = computed(() => {
  const s = title.value?.durationSecs
  if (!s) return '1h 48m'
  return `${Math.floor(s / 3600)}h ${Math.round((s % 3600) / 60)}m`
})

// "More Like This": other catalog entries, excluding the current title.
const moreLikeThis = computed(() =>
  CATALOG.filter((t) => t.id !== props.id).slice(0, 12),
)

function play() {
  router.push(`/watch/${props.id}`)
}

function openTitle(t: Title) {
  router.push(`/title/${t.id}`)
}

function goHome() {
  router.push('/')
}

// Return to where you came from (home on a deep link) — Esc/Back or the button.
function goBack() {
  window.history.length > 1 ? router.back() : router.push('/')
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' || e.key === 'Backspace') goBack()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div v-if="title">
    <!-- Full-bleed backdrop hero -->
    <section class="relative">
      <div class="relative h-[64vh] min-h-[420px] w-full overflow-hidden">
        <img
          v-if="title.backdrop"
          :src="title.backdrop"
          :alt="title.title"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div v-else class="absolute inset-0 bg-app"></div>
        <!-- bottom + left gradients keep text legible over art -->
        <div class="hero-fade-bottom absolute inset-0"></div>
        <div class="hero-fade-left absolute inset-0"></div>
      </div>

      <button
        data-nav
        type="button"
        aria-label="Back"
        class="absolute left-5 md:left-content-x top-6 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full glass text-fg transition-transform duration-200 hover:scale-105 focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
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

      <!-- Hero content overlaps the bottom of the backdrop -->
      <div
        class="absolute inset-x-0 bottom-0 px-5 md:px-content-x pb-6 md:pb-content-y space-y-row"
      >
        <h1 class="text-4xl md:text-5xl font-bold max-w-2xl">
          {{ title.title }}
        </h1>

        <!-- Real fields when present (#104); stubs until the API fills them. -->
        <div class="flex items-center gap-2 text-sm text-soft">
          <span>{{ title.year ?? 2025 }}</span>
          <span class="text-muted">·</span>
          <span>{{ stubGenre }}</span>
          <span class="text-muted">·</span>
          <span>{{ runtime }}</span>
          <template v-if="title.contentRating">
            <span class="text-muted">·</span>
            <span>{{ title.contentRating }}</span>
          </template>
        </div>

        <p v-if="title.overview" class="max-w-2xl text-sm text-soft/90 line-clamp-3">
          {{ title.overview }}
        </p>

        <div class="pt-1">
          <button
            data-nav
            type="button"
            class="card inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-base font-semibold text-fg"
            @click="play"
          >
            <svg
              viewBox="0 0 24 24"
              class="h-5 w-5"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Play
          </button>
        </div>
      </div>
    </section>

    <!-- More Like This shelf reuses Shelf + PosterCard -->
    <div class="px-5 md:px-content-x py-6 md:py-content-y">
      <Shelf heading="More Like This" gap="gap-row">
        <PosterCard
          v-for="t in moreLikeThis"
          :key="t.id"
          :title="t"
          :caption="t.title"
          @select="openTitle(t)"
        />
      </Shelf>
    </div>
  </div>

  <!-- Unknown id: explicit, not a silent blank screen. -->
  <div
    v-else
    class="px-5 md:px-content-x py-6 md:py-content-y flex flex-col items-start gap-row"
  >
    <h1 class="text-3xl font-bold">Title not found</h1>
    <p class="text-soft">No title matches id "{{ id }}".</p>
    <button
      type="button"
      class="card rounded-full bg-surface px-6 py-2.5 font-semibold ring-1 ring-white/15"
      @click="goHome"
    >
      Back to Home
    </button>
  </div>
</template>

<style scoped>
.hero-fade-bottom {
  background: linear-gradient(
    to top,
    var(--color-app) 0%,
    rgba(28, 28, 30, 0.6) 28%,
    rgba(28, 28, 30, 0) 60%
  );
}
.hero-fade-left {
  background: linear-gradient(
    to right,
    rgba(28, 28, 30, 0.65) 0%,
    rgba(28, 28, 30, 0) 45%
  );
}
</style>
