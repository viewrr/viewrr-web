/// <reference types="vite/client" />

// Declare *.vue imports so vue-tsc resolves them on all platforms
// (linux vue-tsc doesn't infer them natively the way macOS does).
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
