<script setup lang="ts">
import type { Title } from '../types'

defineProps<{ title: Title; rank: number; caption?: string }>()
defineEmits<{ select: [] }>()
</script>

<template>
  <div class="shrink-0 flex items-end gap-1">
    <span class="num text-[110px] w-[58px] text-right -mr-1">{{ rank }}</span>
    <button class="text-left" @click="$emit('select')">
      <img
        :src="title.poster"
        :alt="title.title"
        class="card w-[150px] aspect-[2/3] object-cover rounded-card"
      />
      <div v-if="caption" class="mt-2 text-sm text-soft">{{ caption }}</div>
    </button>
  </div>
</template>
