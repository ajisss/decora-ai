import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Honor the PORT assigned by the preview harness so its proxy target matches.
// Default 4488 for manual `npm run dev` — deliberately away from 5173 so it
// never collides with another Vite project.
const port = process.env.PORT ? Number(process.env.PORT) : 4488

export default defineConfig({
  plugins: [react()],
  server: {
    port,
    strictPort: false,
  },
})
