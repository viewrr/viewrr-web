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
    <div class="relative w-[150px]">
      <img
        :src="title.poster ?? ''"
        :alt="title.title"
        class="card w-[150px] aspect-[2/3] object-cover rounded-card"
      />
      <span
        v-if="badge"
        class="absolute top-2 right-2 text-[10px] font-semibold bg-black/60 backdrop-blur px-1.5 py-0.5 rounded pointer-events-none"
      >{{ badge }}</span>
    </div>
    <div v-if="caption" class="mt-2 text-sm text-soft w-[150px] truncate">
      {{ caption }}
    </div>
  </button>
</template>
