<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/client'
import { CATALOG, GENRES, BADGES } from '../data/catalog'
import type { Title } from '../types'
import Hero from '../components/Hero.vue'
import Shelf from '../components/Shelf.vue'
import PosterCard from '../components/PosterCard.vue'
import Top10Card from '../components/Top10Card.vue'
import LandscapeCard from '../components/LandscapeCard.vue'

const router = useRouter()

// ponytail: mock is both the instant first paint AND the fallback when the Hub
// is unreachable (dev without backend). Real rows replace it when a call resolves.
type Resume = { title: Title; progress: number }

// ponytail: distinct per-row selections so the no-backend view doesn't read as
// one repeated wall of the same posters. The real Hub replaces each row with its
// own set below; these indices only shape the mock / first paint.
const pick = (...idxs: number[]) => idxs.map((i) => CATALOG[i])

const continueWatching = ref<Resume[]>(
  pick(3, 9, 14, 17, 1).map((title, i) => ({ title, progress: 0.72 - i * 0.13 })),
)
const top10 = ref<Title[]>(CATALOG.slice(0, 10))
const recommended = ref<Title[]>(pick(12, 15, 18, 11, 16, 13, 2, 17, 6, 14))
const recent = ref<Title[]>(pick(19, 17, 16, 14, 13, 10, 8, 7, 5, 4))
const featured = ref<Title[]>(pick(6, 11, 13, 0, 15, 4))

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1)

// Hero cycles through the first few featured titles (tvOS auto-rotate).
const heroIndex = ref(0)
const heroTitle = computed(() => featured.value[heroIndex.value] ?? featured.value[0])
let heroTimer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  heroTimer = setInterval(() => {
    const n = Math.min(featured.value.length, 5)
    if (n) heroIndex.value = (heroIndex.value + 1) % n
  }, 8000)
})
onBeforeUnmount(() => clearInterval(heroTimer))

onMounted(async () => {
  const [cw, t, rec, r, f] = await Promise.allSettled([
    api.continueWatching(),
    api.top10(),
    api.recommendations(),
    api.recentlyAdded(),
    api.featured(),
  ])
  // Continue Watching / Recommendations aren't MediaItems — adapt their distinct
  // shapes (mediaId, percent) to what cards consume.
  if (cw.status === 'fulfilled' && cw.value.length)
    continueWatching.value = cw.value.map((item) => ({
      title: { id: item.mediaId, title: item.title, poster: null, backdrop: null },
      progress: clamp01(item.percent / 100),
    }))
  if (t.status === 'fulfilled' && t.value.length) top10.value = t.value.slice(0, 10)
  if (rec.status === 'fulfilled' && rec.value.length)
    recommended.value = rec.value.map((r) => ({
      id: r.mediaId,
      title: r.title,
      poster: null,
      backdrop: null,
    }))
  if (r.status === 'fulfilled' && r.value.length) recent.value = r.value
  if (f.status === 'fulfilled' && f.value.length) featured.value = f.value.slice(0, 8)
})

function select(t: Title) {
  if (!t.id) return // defensive: skip cards without a detail route
  router.push(`/title/${t.id}`)
}
</script>

<template>
  <div>
    <!-- Apple-TV hero: full-bleed featured backdrop under the glass nav. -->
    <Transition name="hero-fade" mode="out-in">
      <Hero v-if="heroTitle" :key="heroTitle.id" :title="heroTitle" />
    </Transition>

    <div class="px-5 md:px-content-x py-6 md:py-content-y space-y-section md:-mt-16 relative">
    <Shelf v-if="continueWatching.length" heading="Continue Watching" gap="gap-5">
      <LandscapeCard
        v-for="r in continueWatching"
        :key="r.title.id"
        :title="r.title"
        :progress="r.progress"
        @select="select(r.title)"
      />
    </Shelf>

    <Shelf heading="Top 10 Movies this week" gap="gap-top10">
      <Top10Card
        v-for="(t, i) in top10"
        :key="t.id"
        :title="t"
        :rank="i + 1"
        :caption="t.genres?.[0] ?? GENRES[i % GENRES.length]"
        @select="select(t)"
      />
    </Shelf>

    <Shelf heading="Recommended for You" gap="gap-row">
      <PosterCard
        v-for="t in recommended"
        :key="t.id"
        :title="t"
        :caption="t.title"
        @select="select(t)"
      />
    </Shelf>

    <Shelf heading="Recently Added" gap="gap-row">
      <PosterCard
        v-for="t in recent"
        :key="t.id"
        :title="t"
        :caption="t.title"
        @select="select(t)"
      />
    </Shelf>

    <Shelf heading="Featured" gap="gap-5">
      <LandscapeCard
        v-for="(t, i) in featured"
        :key="t.id"
        :title="t"
        :badge="BADGES[i % BADGES.length]"
        @select="select(t)"
      />
    </Shelf>
    </div>
  </div>
</template>

<style scoped>
.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 0.6s ease;
}
.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}
</style>

