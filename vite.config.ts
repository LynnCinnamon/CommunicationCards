import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  /* GitHub Pages serves the app at /<repo-name>/ */
  base: '/CommunicationCards/',
  plugins: [
    preact(),
    // Generates a service worker that caches the built app, so it opens without network
    VitePWA({
      // A new version waits until every app window is closed instead of reloading open ones
      // (that could happen mid-conversation). An "update available" banner comes later.
      registerType: 'prompt',
      // Adds a small registration script to index.html
      injectRegister: 'auto',
      // No web app manifest yet; that is the next step
      manifest: false,
    }),
  ],
})
