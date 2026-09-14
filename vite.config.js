import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// base relative : fonctionne sur GitHub Pages quel que soit le nom du repo
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Muscu - Suivi hypertrophie',
        short_name: 'Muscu',
        description: 'Suivi de programme full body 3x/semaine, données versionnées sur GitHub',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#111418',
        theme_color: '#111418',
        lang: 'fr',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        // L'app (HTML/JS/CSS/icône) est pré-cachée ; l'API GitHub n'est jamais
        // interceptée (les requêtes non listées passent directement au réseau).
        globPatterns: ['**/*.{js,css,html,svg}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
