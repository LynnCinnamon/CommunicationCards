import preact from '@preact/preset-vite'
import { minimal2023Preset } from '@vite-pwa/assets-generator/config'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Replaces the generator's default white; "contain" keeps the whole icon visible
const iconBackground = { fit: 'contain', background: '#f4f4f5' } as const

// https://vite.dev/config/
export default defineConfig({
  /* GitHub Pages serves the app at /<repo-name>/ */
  base: '/CommunicationCards/',
  plugins: [
    preact(),
    // Generates a service worker that caches the built app, so it opens without network
    VitePWA({
      // A new version waits instead of reloading open windows (that could happen mid-conversation);
      // UpdateBanner offers the reload, otherwise it activates once every app window is closed
      registerType: 'prompt',
      // Registration happens in UpdateBanner via useRegisterSW, so 'auto' injects no extra script
      injectRegister: 'auto',
      manifest: {
        name: 'Communication Cards',
        short_name: 'CommCards',
        theme_color: '#18181b',
        background_color: '#18181b',
        lang: 'de',
        id: 'communication-cards',
      },
      workbox: {
        // Cache the built app (index.html, JS, CSS) and the generated icons
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
      // Renders the PNG icons (browser tab, Android, iOS) from the SVG and adds their <link> tags
      pwaAssets: {
        image: 'public/favicon.svg',
        preset: {
          ...minimal2023Preset,
          // Maskable (Android) and Apple icons need an opaque background; use the app's light --bg.
          // Padding 0.15 instead of the preset's 0.3: the cards' outermost corners then reach
          // about 37% of the icon size from the centre, inside Android's 40% safe circle.
          maskable: { ...minimal2023Preset.maskable, padding: 0.15, resizeOptions: iconBackground },
          apple: { ...minimal2023Preset.apple, padding: 0.15, resizeOptions: iconBackground },
        },
      },
    }),
  ],
})
