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
    <h2 class="text-[22px] font-bold mb-4 flex items-center gap-1">
      {{ heading }} <span class="text-white/40">›</span>
    </h2>
    <div class="row flex overflow-x-auto pb-3" :class="gap">
      <slot />
    </div>
  </section>
</template>

<!-- Global focus-ring bridge for spatial nav (#107).
     The focus ring lives on the .card <img>, but the focusable element is the
     wrapping <button data-nav>. When a card button receives keyboard focus we
     mirror the hover/.card:focus-visible treatment onto its inner .card. -->
<style>
[data-nav]:focus-visible {
  outline: none;
}
[data-nav]:focus-visible .card {
  transform: scale(1.06);
  box-shadow: 0 18px 44px -12px rgba(0, 0, 0, 0.85),
    0 0 0 3px var(--color-focus);
  z-index: 10;
  outline: none;
}
</style>
