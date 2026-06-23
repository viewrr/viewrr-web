<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api/client'
import { CATALOG } from '../data/catalog'
import type { Title } from '../types'
import PosterCard from './PosterCard.vue'

const router = useRouter()

const query = ref('')
const results = ref<Title[]>([])
const loading = ref(false)
const searched = ref(false)

// Local mock fallback so search works in dev without a Hub backend.
function mockSearch(q: string): Title[] {
  const needle = q.toLowerCase()
  return CATALOG.filter((t) => t.title.toLowerCase().includes(needle))
}

let debounceTimer: ReturnType<typeof setTimeout> | undefined
let activeRequest = 0

async function runSearch(q: string) {
  const requestId = ++activeRequest
  loading.value = true
  let hits: Title[]
  try {
    hits = await api.search(q)
    // Empty server result → fall back to the local catalog (no Hub in dev).
    if (!hits || hits.length === 0) hits = mockSearch(q)
  } catch {
    hits = mockSearch(q)
  }
  // Ignore stale responses if a newer query has started.
  if (requestId !== activeRequest) return
  results.value = hits
  loading.value = false
  searched.value = true
}

watch(query, (q) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  const trimmed = q.trim()
  if (!trimmed) {
    results.value = []
    loading.value = false
    searched.value = false
    activeRequest++ // cancel any in-flight result
    return
  }
  debounceTimer = setTimeout(() => runSearch(trimmed), 300)
})

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})

function select(t: Title) {
  router.push('/title/' + t.id)
}
</script>

<template>
  <div class="px-content-x py-content-y">
    <div class="max-w-2xl">
      <input
        v-model="query"
        data-nav
        type="search"
        autofocus
        placeholder="Search movies, shows, music"
        class="card w-full bg-surface text-fg rounded-large px-5 py-3 text-lg placeholder:text-muted focus:outline-none"
      />
    </div>

    <div class="mt-8">
      <p v-if="!query.trim()" class="text-muted">
        Start typing to search movies, shows, and music.
      </p>

      <p v-else-if="loading" class="text-muted">Searching…</p>

      <p v-else-if="searched && results.length === 0" class="text-soft">
        No matches for “{{ query.trim() }}”
      </p>

      <div
        v-else
        class="grid gap-row [grid-template-columns:repeat(auto-fill,150px)]"
      >
        <PosterCard
          v-for="t in results"
          :key="t.id"
          :title="t"
          :caption="t.title"
          @select="select(t)"
        />
      </div>
    </div>
  </div>
</template>
