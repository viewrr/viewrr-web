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

const continueWatching = ref<Resume[]>(
  CATALOG.slice(0, 5).map((title, i) => ({ title, progress: 0.3 + i * 0.1 })),
)
const top10 = ref<Title[]>(CATALOG.slice(0, 10))
const recommended = ref<Title[]>(CATALOG.slice(4, 16))
const recent = ref<Title[]>(CATALOG.slice(8, 20))
const featured = ref<Title[]>(CATALOG.slice(0, 8))
const albums = ref<Title[]>(CATALOG.slice(2, 14))

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
  const [cw, t, rec, r, f, a] = await Promise.allSettled([
    api.continueWatching(),
    api.top10(),
    api.recommendations(),
    api.recentlyAdded(),
    api.featured(),
    api.musicAlbums(),
  ])
  // Continue Watching / Recommendations / Albums aren't MediaItems — adapt
  // their distinct shapes (mediaId, percent, album name) to what cards consume.
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
  if (a.status === 'fulfilled' && a.value.length)
    albums.value = a.value.map((al) => ({
      id: '', // albums have no media id / detail route yet
      title: al.album,
      poster: null,
      backdrop: null,
    }))
})

function select(t: Title) {
  if (!t.id) return // album cards have no detail route
  router.push(`/title/${t.id}`)
}
</script>

<template>
  <div>
    <!-- Apple-TV hero: full-bleed featured backdrop under the glass nav. -->
    <Transition name="hero-fade" mode="out-in">
      <Hero v-if="heroTitle" :key="heroTitle.id" :title="heroTitle" />
    </Transition>

    <div class="px-content-x py-content-y space-y-section -mt-16 relative">
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

    <Shelf heading="Recommended" gap="gap-row">
      <PosterCard
        v-for="t in recommended"
        :key="t.id"
        :title="t"
        :caption="t.title"
        badge="viewrr"
        @select="select(t)"
      />
    </Shelf>

    <Shelf heading="Recently Added" gap="gap-row">
      <PosterCard
        v-for="t in recent"
        :key="t.id"
        :title="t"
        :caption="t.title"
        badge="viewrr"
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

    <Shelf heading="Music Albums" gap="gap-row">
      <PosterCard
        v-for="t in albums"
        :key="t.id"
        :title="t"
        :caption="t.title"
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

