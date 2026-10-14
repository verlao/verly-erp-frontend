/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/vue" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_POST_LOGIN_REDIRECT?: string
  // Feature flags de build (src/lib/flags.ts). Ligadas só com o valor 'true'.
  readonly VITE_FLAG_PIX_ORDER_LINK?: string
  readonly VITE_FLAG_PIX_DISMISS?: string
  readonly VITE_FLAG_LIVE_EVENTS?: string
  readonly VITE_FLAG_LEAD_SNOOZE?: string
  readonly VITE_FLAG_LEAD_LOST_REASON?: string
  readonly VITE_FLAG_INSTALLATION_SCHEDULE?: string
  readonly VITE_FLAG_MOBILE_SHELL?: string
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
