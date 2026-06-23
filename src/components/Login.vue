<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api/client'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

// Disable Sign In until both fields have content (keeps empty submits off the wire).
const canSubmit = computed(
  () => username.value.trim().length > 0 && password.value.length > 0,
)

async function onSubmit() {
  // Guard against double-submit: a second Enter/click while in flight is a no-op.
  if (loading.value) return
  error.value = null
  loading.value = true
  try {
    await login(username.value, password.value)
    router.push('/')
  } catch {
    // The thrown Error carries the status/path (e.g. "/auth/login → 401"); never
    // surface that to the user and never echo the password. Fixed friendly message.
    error.value = 'Invalid username or password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-page grid place-items-center px-6 font-sans">
    <form
      class="w-full max-w-[380px] bg-surface rounded-large px-content-x py-content-y flex flex-col gap-6"
      @submit.prevent="onSubmit"
    >
      <h1 class="text-2xl font-semibold tracking-tight text-center">viewrr</h1>

      <div class="flex flex-col gap-3">
        <input
          v-model="username"
          data-nav
          type="text"
          autocomplete="username"
          placeholder="Username"
          class="login-field w-full bg-app text-fg placeholder:text-muted rounded-card px-4 py-3"
        />
        <input
          v-model="password"
          data-nav
          type="password"
          autocomplete="current-password"
          placeholder="Password"
          class="login-field w-full bg-app text-fg placeholder:text-muted rounded-card px-4 py-3"
        />
      </div>

      <p v-if="error" class="text-accent text-sm text-center -mt-2" role="alert">
        {{ error }}
      </p>

      <button
        data-nav
        type="submit"
        :disabled="loading || !canSubmit"
        class="login-field w-full bg-accent text-fg rounded-full px-4 py-3 font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Signing in…' : 'Sign In' }}
      </button>
    </form>
  </div>
</template>

<!-- Keyboard/remote focus affordance, mirroring TopNav.vue's data-nav ring (#107). -->
<style scoped>
.login-field:focus,
.login-field:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-focus);
}
</style>
