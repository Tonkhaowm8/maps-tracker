import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Listen on all IP addresses (allow network access)
    port: 3000        // Optional: specify the port (default is 3000)
  },
})
