import { useState } from 'react'
import { StepIcon } from '../icons.jsx'
import { TAXONOMY_ORDER } from '../analyzer/AnalyzePanel.jsx'
import { content } from '../../content.js'

const t = content.app.analyze

// Level 4 (Objects): category → item tree, built from the same grouping
// AnalyzePanel already computes, just presented as a collapsible tree
// instead of flat sections. Shared by the Inspector (compact) and the
// "Checklist & Brief" project-nav section (full width).
export default function AnalysisTree({ analysis, selectedObjectId, onSelect, compact = false }) {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState(() => new Set())

  if (!analysis?.items?.length) return null

  const queryLower = query.trim().toLowerCase()
  const groups = TAXONOMY_ORDER.map((cat) => ({
    cat,
    items: analysis.items.filter(
      (i) => i.category === cat && (!queryLower || i.name.toLowerCase().includes(queryLower)),
    ),
  })).filter((g) => g.items.length > 0)

  const toggle = (cat) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })

  return (
    <div className="space-y-2">
      {!compact && (
        <div className="relative">
          <StepIcon name="search" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${t.title}…`}
            className="h-8 w-full rounded-lg border border-paper-line bg-paper pl-8 pr-2 text-xs focus:border-clay focus:outline-none"
          />
        </div>
      )}
      <div className="space-y-0.5">
        {groups.map(({ cat, items }) => {
          const isCollapsed = collapsed.has(cat)
          return (
            <div key={cat}>
              <button
                type="button"
                onClick={() => toggle(cat)}
                className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs font-medium text-ink-soft hover:bg-paper-soft"
              >
                <StepIcon name={isCollapsed ? 'chevronRight' : 'chevronDown'} className="h-3 w-3 shrink-0 text-ink-muted" />
                <span className="flex-1 truncate">{t.categoryLabels[cat] ?? cat}</span>
                <span className="text-ink-muted">({items.length})</span>
              </button>
              {!isCollapsed && (
                <div className="ml-4 space-y-0.5 border-l border-paper-line pl-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item.id === selectedObjectId ? null : item.id)}
                      className={`flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs transition-colors ${
                        item.id === selectedObjectId ? 'bg-clay-soft text-clay-deep' : 'text-ink-soft hover:bg-paper-soft'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          item.id === selectedObjectId ? 'bg-clay' : 'bg-paper-line'
                        }`}
                      />
                      <span className="flex-1 truncate">{item.name}</span>
                      {item.estimatedQuantity && <span className="text-ink-muted">{item.estimatedQuantity}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
