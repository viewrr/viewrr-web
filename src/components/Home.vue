<script setup lang="ts">
import { CATALOG, GENRES, BADGES } from '../data/catalog'
import type { Title } from '../types'
import Shelf from './Shelf.vue'
import PosterCard from './PosterCard.vue'
import Top10Card from './Top10Card.vue'
import LandscapeCard from './LandscapeCard.vue'

const top10 = CATALOG.slice(0, 10)
const recent = CATALOG.slice(8, 20)
const featured = CATALOG.slice(0, 8)

// ponytail: player/detail navigation lands later in #106; stub for now.
function select(_t: Title) {}
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
