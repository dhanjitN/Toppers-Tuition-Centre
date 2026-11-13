import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.jpeg', 'rank-fire.svg', 'rank-forest.svg', 'rank-stone.svg', 'rank-sunrise.svg', 'rank-water.svg'],
      manifest: {
        name: 'Toppers Tuition Centre',
        short_name: 'Toppers',
        description: 'Your Toppers Tuition Centre student dashboard.',
        theme_color: '#f6f7f2',
        background_color: '#f6f7f2',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'logo.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'logo.jpeg',
            sizes: '512x512',
            type: 'image/jpeg'
          },
          {
            src: 'logo.jpeg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
