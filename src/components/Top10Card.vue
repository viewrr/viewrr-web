<script setup lang="ts">
import type { Title } from '../types'

defineProps<{ title: Title; rank: number; caption?: string }>()
defineEmits<{ select: [] }>()
</script>

<template>
  <div class="shrink-0 flex items-end">
    <span class="num text-[150px] w-[72px] text-right -mr-4 relative z-0">{{ rank }}</span>
    <button data-nav class="relative z-10 text-left" @click="$emit('select')">
      <img
        v-tilt
        :src="title.poster ?? ''"
        :alt="title.title"
        class="card w-[150px] aspect-[2/3] object-cover rounded-card"
      />
      <div v-if="caption" class="mt-2 text-sm text-soft">{{ caption }}</div>
    </button>
  </div>
</template>
