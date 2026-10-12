import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The website may be served from a sub-folder (for example GitHub Pages): build with VITE_BASE=/folder/. The Android app
  // needs the default '/'.
  base: process.env.VITE_BASE || '/',
  test: {
    globals: true,
    environment: 'node',
  },
})
