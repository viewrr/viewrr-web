<script setup lang="ts">
import type { Title } from '../types'

defineProps<{ title: Title; badge?: string; progress?: number }>()
defineEmits<{ select: [] }>()
</script>

<template>
  <button
    v-tilt
    data-nav
    class="card shrink-0 relative rounded-large overflow-hidden w-[300px] sm:w-[380px] md:w-[460px]"
    @click="$emit('select')"
  >
    <img
      v-if="title.backdrop"
      :src="title.backdrop"
      :alt="title.title"
      class="w-full aspect-video object-cover"
    />
    <div v-else class="w-full aspect-video bg-surface grid place-items-center px-4 text-center">
      <span class="text-sm text-muted line-clamp-2">{{ title.title }}</span>
    </div>
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
    <span
      v-if="badge"
      class="absolute bottom-3 left-4 text-xs font-medium bg-white/15 backdrop-blur px-2.5 py-1 rounded-full"
    >{{ badge }}</span>
    <span class="absolute bottom-3 right-4 text-base font-semibold drop-shadow">
      {{ title.title }}
    </span>
    <div
      v-if="progress != null"
      class="absolute bottom-0 inset-x-0 h-1 bg-white/20"
    >
      <div class="h-full bg-accent" :style="{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }" />
    </div>
  </button>
</template>
