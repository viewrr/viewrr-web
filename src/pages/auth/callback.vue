<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { handleCallback } from '../../api/oidc'

const router = useRouter()
const error = ref(false)

onMounted(async () => {
  try {
    await handleCallback()
    router.replace('/')
  } catch {
    error.value = true
  }
})
</script>

<template>
  <div class="min-h-screen bg-page grid place-items-center text-soft">
    <p v-if="!error">Signing you in…</p>
    <div v-else class="flex flex-col items-center gap-3">
      <p>Sign-in failed.</p>
      <button class="rounded-full bg-surface px-6 py-2.5 font-semibold" @click="router.replace('/login')">
        Back to login
      </button>
    </div>
  </div>
</template>
