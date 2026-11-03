import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    restoreMocks: true,
    // East of UTC, like most of our users: 00:00–05:30 local is still the
    // previous UTC day, which is exactly where date bugs show up.
    env: { TZ: 'Asia/Kolkata' },
  },
})
