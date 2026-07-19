import { useState } from 'react'
import { StepIcon } from '../icons.jsx'
import { groupItems } from './analysis/taxonomy.js'
import { content } from '../../content.js'

const t = content.app.analyze

// Level 4 (Objects): the decoration analysis as a collapsible category → item
// tree, replacing the old flat checklist sections.
//
// This component owns hierarchy ONLY. Leaves are rendered through `renderRow`
// so the two surfaces can differ without either duplicating the other:
//   * Inspector  — no renderRow, gets the compact one-line selectable leaf
//   * Checklist & Brief — passes ChecklistItemRow, gets full editing
// No editing logic lives here, and no grouping logic lives in the row.
export default function AnalysisTree({
  items,
  selectedObjectId,
  onSelect,
  density = 'compact',
  searchable = false,
  renderRow,
}) {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState(() => new Set())

  const groups = groupItems(items, searchable ? query : '')

  const toggle = (cat) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })

  if (!items?.length) return null

  return (
    <div className={density === 'full' ? 'space-y-3' : 'space-y-2'}>
      {searchable && (
        <div className="relative">
          <StepIcon
            name="search"
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="h-9 w-full rounded-lg border border-paper-line bg-paper pl-8 pr-2 text-sm focus:border-clay focus:outline-none"
          />
        </div>
      )}

      {groups.length === 0 && <p className="py-4 text-center text-xs text-ink-muted">{t.noMatch}</p>}

      <div className={density === 'full' ? 'space-y-2' : 'space-y-0.5'}>
        {groups.map(({ cat, items: catItems }) => {
          const isCollapsed = collapsed.has(cat)
          return (
            <div key={cat} className={density === 'full' ? 'rounded-xl2 border border-paper-line bg-paper' : ''}>
              <button
                type="button"
                onClick={() => toggle(cat)}
                aria-expanded={!isCollapsed}
                className={`flex w-full items-center gap-1.5 rounded-md text-left font-medium text-ink-soft hover:bg-paper-soft ${
                  density === 'full' ? 'px-3 py-2 text-sm' : 'px-1.5 py-1 text-xs'
                }`}
              >
                <StepIcon
                  name={isCollapsed ? 'chevronRight' : 'chevronDown'}
                  className="h-3 w-3 shrink-0 text-ink-muted"
                />
                <span className="flex-1 truncate">{t.categoryLabels[cat] ?? cat}</span>
                <span className="text-ink-muted">({catItems.length})</span>
              </button>

              {!isCollapsed &&
                (renderRow ? (
                  <div className="space-y-1 border-t border-paper-line p-2">{catItems.map(renderRow)}</div>
                ) : (
                  <div className="ml-4 space-y-0.5 border-l border-paper-line pl-2">
                    {catItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className={`flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs transition-colors ${
                          item.id === selectedObjectId
                            ? 'bg-clay-soft text-clay-deep'
                            : 'text-ink-soft hover:bg-paper-soft'
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
                ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
