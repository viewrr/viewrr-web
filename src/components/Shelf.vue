<script setup lang="ts">
import { useSpatialNav } from '../composables/useSpatialNav'

withDefaults(defineProps<{ heading: string; gap?: string }>(), {
  gap: 'gap-row',
})

// Self-register this shelf into the shared D-pad navigation system (#107).
// Refcounted at module level, so calling it from every shelf is safe.
useSpatialNav()
</script>

<template>
  <section>
    <h2 class="text-xl font-semibold tracking-tight mb-2 flex items-center gap-1.5">
      {{ heading }}
      <span class="text-white/25 text-lg font-normal translate-y-px">›</span>
    </h2>
    <!-- pt absorbs the focus lift+ring so the top isn't clipped by overflow. -->
    <div class="row flex overflow-x-auto pt-4 pb-3 px-1 -mx-1" :class="gap">
      <slot />
    </div>
  </section>
</template>

<!-- Global focus-ring bridge for spatial nav (#107).
     The focus ring lives on the .card element (poster/backdrop), but the focusable
     element is the wrapping data-nav button. When a card button receives keyboard
     focus we mirror the hover/.card:focus-visible treatment onto its inner .card. -->
<style>
[data-nav]:focus-visible {
  outline: none;
}
[data-nav]:focus-visible .card {
  transform: scale(1.07) translateY(-6px);
  box-shadow: 0 26px 56px -14px rgba(0, 0, 0, 0.9),
    0 0 0 3px var(--color-focus);
  z-index: 10;
  outline: none;
}
</style>
