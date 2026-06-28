<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Title } from '../types'

const props = defineProps<{ title: Title }>()
const router = useRouter()
</script>

<template>
  <section class="relative h-[58vh] min-h-[340px] md:h-[78vh] md:min-h-[460px] w-full overflow-hidden">
    <img
      :src="title.backdrop ?? title.poster ?? ''"
      :alt="title.title"
      class="absolute inset-0 h-full w-full object-cover"
    />
    <div class="hero-bottom absolute inset-0"></div>
    <div class="hero-left absolute inset-0"></div>

    <div class="absolute inset-x-0 bottom-0 px-5 md:px-content-x pb-6 md:pb-content-y space-y-4">
      <h1 class="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight max-w-3xl drop-shadow-lg">
        {{ title.title }}
      </h1>
      <p
        v-if="title.overview"
        class="max-w-xl text-sm text-soft/90 line-clamp-2"
      >
        {{ title.overview }}
      </p>

      <div class="flex items-center gap-3 pt-2">
        <button
          data-nav
          type="button"
          class="card inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-base font-semibold text-fg"
          @click="router.push(`/watch/${title.id}`)"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          Play
        </button>
        <button
          data-nav
          type="button"
          class="card inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-7 py-3 text-base font-semibold text-fg"
          @click="router.push(`/title/${title.id}`)"
        >
          More Info
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-bottom {
  background: linear-gradient(
    to top,
    var(--color-app) 2%,
    rgba(28, 28, 30, 0.5) 30%,
    rgba(28, 28, 30, 0) 65%
  );
}
.hero-left {
  background: linear-gradient(
    to right,
    rgba(28, 28, 30, 0.7) 0%,
    rgba(28, 28, 30, 0) 50%
  );
}
</style>
