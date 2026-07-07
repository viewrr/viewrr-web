<script setup lang="ts">
import { useRouter } from 'vue-router'
import { isAuthenticated } from '../api/client'
import { useSpatialNav } from '../composables/useSpatialNav'

const router = useRouter()

const links = [
  { label: 'Home', to: '/' },
  { label: 'Movies', to: '/movies' },
  { label: 'Shows', to: '/shows' },
  { label: 'Music', to: '/music' },
]

// Register the nav bar as a spatial-navigation participant so Up from the top
// shelf lands on the nav links and Down returns to the content (#107).
useSpatialNav()

function onAccountClick() {
  router.push(isAuthenticated() ? '/settings' : '/login')
}
</script>

<template>
  <nav class="sticky top-0 z-30 glass">
    <div class="relative h-14 md:h-16 px-5 md:px-content-x flex items-center gap-3">
      <span class="text-xl font-semibold tracking-tight shrink-0">viewrr</span>
      <!-- Tabs: inline + scrollable on mobile, centered pill bar on md+. -->
      <div class="row flex items-center gap-1 text-sm md:text-[15px] min-w-0 flex-1 overflow-x-auto md:flex-none md:absolute md:left-1/2 md:-translate-x-1/2">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          data-nav
          class="shrink-0 whitespace-nowrap px-3 md:px-3.5 py-1.5 rounded-full text-muted hover:text-fg transition-colors"
          exact-active-class="bg-white/10 text-fg"
        >{{ link.label }}</RouterLink>
      </div>
      <div class="ml-auto shrink-0 flex items-center gap-3 md:gap-4">
        <button data-nav class="size-9 grid place-items-center rounded-full hover:bg-white/10" aria-label="Search" @click="router.push('/search')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" stroke-linecap="round" />
          </svg>
        </button>
        <button
          data-nav
          aria-label="Account"
          class="size-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600"
          @click="onAccountClick"
        />
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
