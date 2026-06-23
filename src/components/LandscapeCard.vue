<script setup lang="ts">
import type { Title } from '../types'

defineProps<{ title: Title; badge?: string }>()
defineEmits<{ select: [] }>()
</script>

<template>
  <button
    data-nav
    class="card shrink-0 relative rounded-large overflow-hidden w-[460px]"
    @click="$emit('select')"
  >
    <img :src="title.backdrop" :alt="title.title" class="w-full aspect-video object-cover" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
    <span
      v-if="badge"
      class="absolute bottom-3 left-4 text-xs font-medium bg-white/15 backdrop-blur px-2.5 py-1 rounded-full"
    >{{ badge }}</span>
    <span class="absolute bottom-3 right-4 text-base font-semibold drop-shadow">
      {{ title.title }}
    </span>
  </button>
</template>
