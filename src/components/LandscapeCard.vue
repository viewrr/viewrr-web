<script setup lang="ts">
import { ref } from 'vue'
import type { Title } from '../types'
import MediaFallback from './MediaFallback.vue'

// Fall back to the branded tile on missing art OR a failed image load.
const broken = ref(false)

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
      v-if="title.backdrop && !broken"
      :src="title.backdrop"
      :alt="title.title"
      class="w-full aspect-video object-cover"
      @error="broken = true"
    />
    <MediaFallback v-else aspect="landscape" class="w-full" />
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
