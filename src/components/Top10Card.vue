<script setup lang="ts">
import { ref } from 'vue'
import type { Title } from '../types'
import MediaFallback from './MediaFallback.vue'

// Fall back to the branded tile on missing art OR a failed image load.
const broken = ref(false)

defineProps<{ title: Title; rank: number; caption?: string }>()
defineEmits<{ select: [] }>()
</script>

<template>
  <div class="shrink-0 flex items-end">
    <span
      class="num text-[96px] w-[46px] -mr-2 md:text-[150px] md:w-[72px] md:-mr-4 text-right relative z-0"
    >{{ rank }}</span>
    <button data-nav class="relative z-10 text-left" @click="$emit('select')">
      <img
        v-if="title.poster && !broken"
        v-tilt
        :src="title.poster"
        :alt="title.title"
        class="card w-[120px] sm:w-[150px] aspect-[2/3] object-cover rounded-card"
        @error="broken = true"
      />
      <MediaFallback
        v-else
        v-tilt
        :label="title.title"
        aspect="poster"
        class="card w-[120px] sm:w-[150px] rounded-card"
      />
      <div v-if="caption" class="mt-2 text-sm text-soft">{{ caption }}</div>
    </button>
  </div>
</template>
