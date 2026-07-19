import { useState } from 'react'
import { StepIcon } from '../icons.jsx'
import { groupItems } from './analysis/taxonomy.js'
import { content } from '../../content.js'

const t = content.app.analyze

// A glyph per category so the tree scans by shape, not just by text.
const CATEGORY_ICON = {
  Stage: 'produce',
  Backdrop: 'image',
  Chairs: 'store',
  'VIP Chairs': 'star',
  Tables: 'store',
  Flowers: 'spark',
  Lighting: 'preview',
  Walkway: 'arrow',
  'Reception Desk': 'brief',
  'Ceiling Decoration': 'layersToggle',
  'LED Screen': 'image',
  Other: 'checklist',
}

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
  query: controlledQuery,
  renderRow,
}) {
  const [ownQuery, setOwnQuery] = useState('')
  const [collapsed, setCollapsed] = useState(() => new Set())

  // Controlled when the consumer wants the search box somewhere else (the
  // Inspector puts it on the "Analysis (N item)" heading row); self-managed
  // when `searchable` renders it inline.
  const isControlled = controlledQuery !== undefined
  const query = isControlled ? controlledQuery : ownQuery
  const setQuery = isControlled ? () => {} : setOwnQuery

  const groups = groupItems(items, isControlled || searchable ? query : '')

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
                  density === 'full' ? 'px-3 py-2 text-sm' : 'px-1.5 py-1.5 text-xs'
                }`}
              >
                <StepIcon
                  name={isCollapsed ? 'chevronRight' : 'chevronDown'}
                  className="h-3 w-3 shrink-0 text-ink-muted"
                />
                <StepIcon name={CATEGORY_ICON[cat] ?? 'checklist'} className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                <span className="flex-1 truncate">{t.categoryLabels[cat] ?? cat}</span>
                <span className="shrink-0 rounded-md bg-paper-line/70 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-ink-muted">
                  {catItems.length}
                </span>
              </button>

              {!isCollapsed &&
                (renderRow ? (
                  <div className="space-y-1 border-t border-paper-line p-2">{catItems.map(renderRow)}</div>
                ) : (
                  <div className="ml-[18px] space-y-0.5">
                    {catItems.map((item) => {
                      const active = item.id === selectedObjectId
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onSelect(item.id)}
                          aria-pressed={active}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                            active ? 'bg-clay-soft font-medium text-clay-deep' : 'text-ink-soft hover:bg-paper-soft'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              active ? 'bg-clay' : 'border border-paper-line bg-paper'
                            }`}
                          />
                          <span className="flex-1 truncate">{item.name}</span>
                          {item.estimatedQuantity && (
                            <span
                              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                                active ? 'bg-clay/15 text-clay-deep' : 'bg-paper-line/70 text-ink-muted'
                              }`}
                            >
                              {item.estimatedQuantity}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Standalone search input, so a consumer can place it outside the tree (the
// Inspector puts it on the heading row) while still filtering the same tree
// via the controlled `query` prop.
AnalysisTree.Search = function AnalysisTreeSearch({ value, onChange, compact = true }) {
  return (
    <div className="relative">
      <StepIcon
        name="search"
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.searchPlaceholder}
        className={`w-full rounded-lg border border-paper-line bg-paper pl-8 pr-2 focus:border-clay focus:outline-none ${
          compact ? 'h-8 text-xs' : 'h-9 text-sm'
        }`}
      />
    </div>
  )
}
