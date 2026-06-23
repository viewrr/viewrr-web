<script setup lang="ts">
import { useSpatialNav } from '../composables/useSpatialNav'

const links = ['Home', 'Movies', 'Shows', 'Music']

// Register the nav bar as a spatial-navigation participant so Up from the top
// shelf lands on the nav links and Down returns to the content (#107).
useSpatialNav()
</script>

<template>
  <nav class="sticky top-0 z-30 glass">
    <div class="h-16 px-content-x flex items-center gap-9">
      <span class="text-xl font-semibold tracking-tight">viewrr</span>
      <div class="flex items-center gap-7 text-[15px] text-muted">
        <a
          v-for="(link, i) in links"
          :key="link"
          href="#"
          data-nav
          :class="i === 0 ? 'text-fg font-medium' : 'hover:text-fg'"
        >{{ link }}</a>
      </div>
      <div class="ml-auto flex items-center gap-5">
        <button data-nav class="size-9 grid place-items-center rounded-full hover:bg-white/10" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" stroke-linecap="round" />
          </svg>
        </button>
        <div class="size-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600" />
      </div>
    </div>
  </nav>
</template>

<!-- Keyboard focus affordance for nav links/buttons under D-pad navigation (#107). -->
<style>
nav [data-nav]:focus-visible {
  outline: none;
  color: var(--color-fg);
  text-shadow: 0 0 0 transparent;
  box-shadow: 0 0 0 2px var(--color-focus);
  border-radius: 6px;
}
</style>
