import { useEffect, useState } from 'react'
import { content } from '../../content.js'
import { useProjects } from '../../context/ProjectsContext.jsx'

// Tiny saving/saved/not-synced indicator in the app-shell breadcrumb area (ux-spec §3.6).
export default function SyncIndicator() {
  const s = content.app.shell
  const { syncState } = useProjects()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (syncState === 'saving' || syncState === 'error') {
      setVisible(true)
      return
    }
    if (syncState === 'saved') {
      setVisible(true)
      const t = setTimeout(() => setVisible(false), 1500)
      return () => clearTimeout(t)
    }
  }, [syncState])

  if (!visible) return null

  if (syncState === 'error') {
    return (
      <span className="cursor-pointer text-xs text-danger" title={s.notSyncedHint}>
        {s.notSynced}
      </span>
    )
  }

  return <span className="text-xs text-ink-muted">{syncState === 'saving' ? s.saving : s.saved}</span>
}
