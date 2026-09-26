import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      'admin.tokzoo.com',
      'motivated-solace-production-5ac8.up.railway.app',
    ],
  },
})