/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import VueRouter from 'unplugin-vue-router/vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // VueRouter must come before the vue plugin.
    VueRouter({ routesFolder: 'src/pages', dts: 'src/typed-router.d.ts' }),
    vue(),
    tailwindcss(),
  ],
  test: {
    environment: 'happy-dom',
    // vitest owns src/ unit tests; Playwright owns tests/. Skip worktrees too.
    exclude: ['**/node_modules/**', '**/dist/**', '**/.claude/**', 'tests/**'],
  },
})
