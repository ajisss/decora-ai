import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Honor the PORT assigned by the preview harness so its proxy target matches.
const port = process.env.PORT ? Number(process.env.PORT) : 5173

export default defineConfig({
  plugins: [react()],
  server: {
    port,
    strictPort: false,
  },
})
