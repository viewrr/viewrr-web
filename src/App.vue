<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TopNav from './components/TopNav.vue'

const route = useRoute()
// Player + login are immersive — hide app chrome. Match by path since
// file-based route names are auto-generated.
const immersive = computed(
  () => route.path.startsWith('/watch/') || route.path === '/login',
)
</script>

<template>
  <div class="min-h-full bg-app text-fg">
    <TopNav v-if="!immersive" />
    <RouterView />
  </div>
</template>
