import { Link } from 'react-router-dom'
import AppShell from '../components/shell/AppShell.jsx'
import { content } from '../content.js'

export default function NotFoundPage() {
  return (
    <AppShell>
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-display text-2xl text-ink">{content.app.notFound.title}</h1>
        <Link to="/projects" className="btn-primary">
          {content.app.notFound.cta}
        </Link>
      </div>
    </AppShell>
  )
}
