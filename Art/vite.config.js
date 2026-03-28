import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // Redirige toutes les requêtes /api vers votre serveur PHP local
      // Adaptez le target selon votre configuration WAMP/XAMPP :
      //   - XAMPP : 'http://localhost/artlens'
      //   - WAMP  : 'http://localhost/artlens'
      //   - PHP built-in server sur port 8080 : 'http://localhost:8080'
      '/api': {
        target: 'http://localhost/artlens',
        changeOrigin: true,
        // Supprime le préfixe /api pour que http://localhost:5173/api/auth/login.php
        // devienne http://localhost/artlens/api/auth/login.php
      }
    }
  }
})
