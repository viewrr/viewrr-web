<script setup lang="ts">
// Branded stand-in when a title has no poster/backdrop art. Reads as a deliberate
// surface (gradient + faint accent glow + image glyph), not a broken image.
defineProps<{ label?: string; aspect?: 'poster' | 'landscape' }>()
</script>

<template>
  <div
    class="media-fallback relative grid place-items-center overflow-hidden text-center"
    :class="aspect === 'landscape' ? 'aspect-video px-5' : 'aspect-[2/3] px-3'"
  >
    <svg
      class="absolute text-fg opacity-[0.14]"
      :class="aspect === 'landscape' ? 'h-9 w-9 top-4' : 'h-8 w-8 top-[15%]'"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" stroke-width="1.6" />
      <circle cx="8.5" cy="9.5" r="1.6" fill="currentColor" />
      <path
        d="M4 18l5-5 4 3 3-3 4 4"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span
      v-if="label"
      class="relative font-medium leading-snug text-soft line-clamp-3"
      :class="aspect === 'landscape' ? 'max-w-[80%] text-sm' : 'text-xs'"
    >{{ label }}</span>
  </div>
</template>

<style scoped>
.media-fallback {
  background:
    radial-gradient(115% 80% at 50% -10%, rgba(255, 84, 112, 0.12), transparent 62%),
    linear-gradient(158deg, var(--color-surface) 0%, var(--color-app) 100%);
}
</style>
