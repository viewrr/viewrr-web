<script setup lang="ts">
withDefaults(defineProps<{ heading: string; gap?: string }>(), {
  gap: 'gap-row',
})
</script>

<template>
  <section>
    <h2 class="text-[22px] font-bold mb-4 flex items-center gap-1">
      {{ heading }} <span class="text-white/40">›</span>
    </h2>
    <div class="row flex overflow-x-auto pb-3" :class="gap">
      <slot />
    </div>
  </section>
</template>
