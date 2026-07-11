import { app } from './app.js'
import { migrate } from './lib/db.js'

const port = process.env.API_PORT ? Number(process.env.API_PORT) : 4489

await migrate()

app.listen(port, () => {
  console.log(`Decor-AI API listening on http://localhost:${port}`)
})
