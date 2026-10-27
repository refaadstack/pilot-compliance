import { fileURLToPath } from 'node:url';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // Client-rendered SPA: every number comes from the API, and Chart.js needs the DOM anyway.
  ssr: false,
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  // Components are used by file name (StatusBadge), not by folder-prefixed name (UiStatusBadge)
  components: [{ path: '~/components', pathPrefix: false }],
  css: ['~/assets/css/main.css'],
  alias: {
    // Response types live next to the API so both apps share one definition (type-only imports).
    '@shared': fileURLToPath(new URL('../api/src/shared', import.meta.url)),
  },
  runtimeConfig: {
    public: {
      // Override with NUXT_PUBLIC_API_BASE
      apiBase: 'http://127.0.0.1:3001/api',
    },
  },
  app: {
    head: {
      title: 'Pilot Compliance Dashboard',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'color-scheme', content: 'light' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },
  typescript: { strict: true, typeCheck: false },
});
