import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'media/brand/logo-orange.svg',
        'media/brand/logo-white.svg',
        'fonts/Lato-Thin.ttf',
        'fonts/Lato-ThinItalic.ttf',
        'fonts/Lato-Light.ttf',
        'fonts/Lato-LightItalic.ttf',
        'fonts/Lato-Regular.ttf',
        'fonts/Lato-Italic.ttf',
        'fonts/Lato-Bold.ttf',
        'fonts/Lato-BoldItalic.ttf',
        'fonts/Lato-Black.ttf',
        'fonts/Lato-BlackItalic.ttf',
      ],
      workbox: {
        runtimeCaching: [
          { urlPattern: /\.(png|jpg|jpeg|webp|gif)$/i, handler: 'StaleWhileRevalidate' },
          { urlPattern: /\.pdf$/i, handler: 'CacheFirst' },
          { urlPattern: /\/api\//, handler: 'StaleWhileRevalidate' },
          {
            urlPattern: /.*\.(?:woff2?|ttf|otf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
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
