import { StepIcon } from '../icons.jsx'
import { content } from '../../content.js'

const t = content.app.studio

// Floating toolbar over the canvas stage. Every control is wired: pan/select
// switch the drag behavior, the magnifiers step the zoom, the percentage
// readout resets to 100%, frame fits, and the layers icon toggles pin labels.
export default function CanvasToolbar({
  tool,
  onToolChange,
  percent,
  onZoomIn,
  onZoomOut,
  onFit,
  showPins,
  onTogglePins,
  canTogglePins,
}) {
  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-paper-line bg-paper p-1 shadow-sm">
      <ToolButton icon="hand" active={tool === 'pan'} onClick={() => onToolChange('pan')} label={t.toolPan} />
      <ToolButton icon="arrow" active={tool === 'select'} onClick={() => onToolChange('select')} label={t.toolSelect} />

      <span className="mx-1 h-4 w-px bg-paper-line" />

      <ToolButton icon="zoomOut" onClick={onZoomOut} label={t.zoomOut} />
      <button
        type="button"
        onClick={onFit}
        title={t.zoomFit}
        className="min-w-[3.25rem] rounded-full px-1 text-xs font-medium text-ink-soft hover:bg-paper-soft"
      >
        {percent}%
      </button>
      <ToolButton icon="zoomTool" onClick={onZoomIn} label={t.zoomIn} />

      <span className="mx-1 h-4 w-px bg-paper-line" />

      <ToolButton icon="frame" onClick={onFit} label={t.zoomFit} />
      {canTogglePins && (
        <ToolButton icon="layersToggle" active={showPins} onClick={onTogglePins} label={t.toggleLabels} />
      )}
    </div>
  )
}

function ToolButton({ icon, active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
        active ? 'bg-clay text-white' : 'text-ink-soft hover:bg-paper-soft'
      }`}
    >
      <StepIcon name={icon} className="h-3.5 w-3.5" />
    </button>
  )
}
