<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/client'
import { CATALOG, GENRES, BADGES } from '../data/catalog'
import type { Title } from '../types'
import Shelf from './Shelf.vue'
import PosterCard from './PosterCard.vue'
import Top10Card from './Top10Card.vue'
import LandscapeCard from './LandscapeCard.vue'

const router = useRouter()

// ponytail: mock is both the instant first paint AND the fallback when the Hub
// is unreachable (dev without backend). Real rows replace it when a call resolves.
const top10 = ref<Title[]>(CATALOG.slice(0, 10))
const recent = ref<Title[]>(CATALOG.slice(8, 20))
const featured = ref<Title[]>(CATALOG.slice(0, 8))

onMounted(async () => {
  const [t, r, f] = await Promise.allSettled([
    api.top10(),
    api.recentlyAdded(),
    api.featured(),
  ])
  if (t.status === 'fulfilled' && t.value.length) top10.value = t.value.slice(0, 10)
  if (r.status === 'fulfilled' && r.value.length) recent.value = r.value
  if (f.status === 'fulfilled' && f.value.length) featured.value = f.value.slice(0, 8)
})

function select(t: Title) {
  router.push(`/title/${t.id}`)
}
</script>

<template>
  <div class="px-content-x py-content-y space-y-section">
    <Shelf heading="Top 10 Movies this week" gap="gap-top10">
      <Top10Card
        v-for="(t, i) in top10"
        :key="t.id"
        :title="t"
        :rank="i + 1"
        :caption="GENRES[i % GENRES.length]"
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
