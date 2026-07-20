import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Honor the PORT assigned by the preview harness so its proxy target matches.
// Default 4488 for manual `npm run dev` — deliberately away from 5173 so it
// never collides with another Vite project.
const port = process.env.PORT ? Number(process.env.PORT) : 4488

const apiPort = process.env.API_PORT ? Number(process.env.API_PORT) : 4489

export default defineConfig({
  plugins: [react()],
  server: {
    port,
    strictPort: true,
    // Bind all interfaces so the dev server is reachable from other devices on
    // the LAN (e.g. a phone). The /api proxy still runs on this host, so
    // proxied backend calls work for the remote device too. In local mode
    // (no Vercel Blob) images/uploads are served by the Express API, so those
    // paths are proxied too; on Vercel they come from Blob's CDN instead.
    host: true,
    proxy: {
      '/api': `http://localhost:${apiPort}`,
      '/images': `http://localhost:${apiPort}`,
      '/uploads': `http://localhost:${apiPort}`,
    },
  },
})
