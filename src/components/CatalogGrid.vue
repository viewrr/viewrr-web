<script setup lang="ts">
import { useRouter } from 'vue-router'
import { CATALOG } from '../data/catalog'
import type { Title } from '../types'
import PosterCard from './PosterCard.vue'

// ponytail: mock has no media-type field, so Movies/Shows/Music all show the
// full catalog for now. Filter by a real `type` once the API exposes one.
withDefaults(defineProps<{ heading: string; items?: Title[] }>(), {
  items: () => CATALOG,
})

const router = useRouter()
const select = (t: Title) => router.push('/title/' + t.id)
</script>

<template>
  <div class="px-content-x py-content-y">
    <h1 class="text-[22px] font-bold mb-6">{{ heading }}</h1>
    <div class="grid gap-row [grid-template-columns:repeat(auto-fill,150px)]">
      <PosterCard
        v-for="t in items"
        :key="t.id"
        :title="t"
        :caption="t.title"
        @select="select(t)"
      />
    </div>
  </div>
</template>
