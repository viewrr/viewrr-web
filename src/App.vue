<script setup lang="ts">
import { useRoute } from 'vue-router'
import TopNav from './components/TopNav.vue'

const route = useRoute()
// Player is immersive — hide app chrome on the watch route.
</script>

<template>
  <div class="min-h-full bg-app text-fg">
    <TopNav v-if="route.name !== 'player' && route.name !== 'login'" />
    <RouterView />
  </div>
</template>
