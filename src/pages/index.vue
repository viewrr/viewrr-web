<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/client'
import { CATALOG, GENRES, BADGES } from '../data/catalog'
import type { Title } from '../types'
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

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1)

onMounted(async () => {
  const [cw, t, rec, r, f] = await Promise.allSettled([
    api.continueWatching(),
    api.top10(),
    api.recommendations(),
    api.recentlyAdded(),
    api.featured(),
  ])
  if (cw.status === 'fulfilled' && cw.value.length)
    continueWatching.value = cw.value.map((item) => ({
      title: item,
      progress: clamp01(item.positionSecs / (item.durationSecs || 1)),
    }))
  if (t.status === 'fulfilled' && t.value.length) top10.value = t.value.slice(0, 10)
  if (rec.status === 'fulfilled' && rec.value.length) recommended.value = rec.value
  if (r.status === 'fulfilled' && r.value.length) recent.value = r.value
  if (f.status === 'fulfilled' && f.value.length) featured.value = f.value.slice(0, 8)
})

function select(t: Title) {
  router.push(`/title/${t.id}`)
}
</script>

<template>
  <div class="px-content-x py-content-y space-y-section">
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
  </div>
</template>
