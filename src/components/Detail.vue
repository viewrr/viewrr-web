<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { CATALOG, GENRES } from '../data/catalog'
import type { Title } from '../types'
import Shelf from './Shelf.vue'
import PosterCard from './PosterCard.vue'

const props = defineProps<{ id: string }>()
const router = useRouter()

const title = computed<Title | undefined>(() =>
  CATALOG.find((t) => t.id === props.id),
)

// Stub metadata — Title carries no year/genre/runtime yet (#106 step 3 wires
// the real API). Derive a stable genre from the id so it doesn't flicker.
const stubGenre = computed(() => {
  const n = Number(props.id)
  const idx = Number.isFinite(n) ? Math.abs(n) % GENRES.length : 0
  return GENRES[idx]
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
</script>

<template>
  <div v-if="title">
    <!-- Full-bleed backdrop hero -->
    <section class="relative">
      <div class="relative h-[64vh] min-h-[420px] w-full overflow-hidden">
        <img
          :src="title.backdrop"
          :alt="title.title"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <!-- bottom + left gradients keep text legible over art -->
        <div class="hero-fade-bottom absolute inset-0"></div>
        <div class="hero-fade-left absolute inset-0"></div>
      </div>

      <!-- Hero content overlaps the bottom of the backdrop -->
      <div
        class="absolute inset-x-0 bottom-0 px-content-x pb-content-y space-y-row"
      >
        <h1 class="text-4xl md:text-5xl font-bold max-w-2xl">
          {{ title.title }}
        </h1>

        <!-- Stub metadata row: year · genre · runtime placeholders -->
        <div class="flex items-center gap-2 text-sm text-soft">
          <span>2025</span>
          <span class="text-muted">·</span>
          <span>{{ stubGenre }}</span>
          <span class="text-muted">·</span>
          <span>1h 48m</span>
        </div>

        <div class="pt-1">
          <button
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
    <div class="px-content-x py-content-y">
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
    class="px-content-x py-content-y flex flex-col items-start gap-row"
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
