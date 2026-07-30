import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: loadEnv(mode, '.').VITE_BASE_PATH || '/forestportal',
  server: {
    port: 3000,
  },
}))
