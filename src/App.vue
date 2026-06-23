<script setup lang="ts">
import TopNav from './components/TopNav.vue'
</script>

<template>
  <div class="min-h-full bg-app text-fg">
    <TopNav />
    <RouterView />
  </div>
</template>
