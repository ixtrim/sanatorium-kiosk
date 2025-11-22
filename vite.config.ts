import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'brand/logo-orange.svg', 'brand/logo-white.svg'],
      manifest: {
        name: 'Sanatorium Kiosk',
        short_name: 'Kiosk',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [] // dorzucimy później
      },
      workbox: {
        runtimeCaching: [
          { urlPattern: /\.(png|jpg|jpeg|webp|gif)$/i, handler: 'StaleWhileRevalidate' },
          { urlPattern: /\.pdf$/i, handler: 'CacheFirst' },
          { urlPattern: /\/api\//, handler: 'StaleWhileRevalidate' }
        ]
      }
    })
  ],
  server: {
    host: true,      // widoczne w LAN
    port: 5173,
    proxy: { '/api': 'http://127.0.0.1:8787' } // użyjemy gdy włączymy Workera
  }
})
