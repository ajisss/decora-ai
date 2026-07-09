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
    proxy: {
      '/api': `http://localhost:${apiPort}`,
      '/images': `http://localhost:${apiPort}`,
    },
  },
})
