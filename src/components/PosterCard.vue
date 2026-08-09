<script setup lang="ts">
import type { Title } from '../types'

defineProps<{
  title: Title
  /** caption under the poster: title text or a genre label */
  caption?: string
  /** small corner badge, e.g. "viewrr" */
  badge?: string
}>()
defineEmits<{ select: [] }>()
</script>

<template>
  <button data-nav class="shrink-0 text-left" @click="$emit('select')">
    <div class="relative w-[120px] sm:w-[150px]">
      <img
        v-if="title.poster"
        v-tilt
        :src="title.poster"
        :alt="title.title"
        class="card w-[120px] sm:w-[150px] aspect-[2/3] object-cover rounded-card"
      />
      <div
        v-else
        v-tilt
        class="card w-[120px] sm:w-[150px] aspect-[2/3] rounded-card bg-surface grid place-items-center px-2 text-center"
      >
        <span class="text-xs text-muted line-clamp-3">{{ title.title }}</span>
      </div>
      <span
        v-if="badge"
        class="absolute top-2 right-2 text-[10px] font-semibold bg-black/60 backdrop-blur px-1.5 py-0.5 rounded pointer-events-none"
      >{{ badge }}</span>
    </div>
    <div v-if="caption" class="mt-2 text-sm text-soft w-[120px] sm:w-[150px] truncate">
      {{ caption }}
    </div>
  </button>
</template>
