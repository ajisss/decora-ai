import { useState } from 'react'
import CanvasStepper from './CanvasStepper.jsx'
import CanvasStage from './CanvasStage.jsx'
import VersionFilmstrip from './VersionFilmstrip.jsx'
import CopilotBar from './CopilotBar.jsx'

// The workspace proper: progress strip, interactive stage, version filmstrip,
// and the docked AI Copilot. Version identity and the version-scoped actions
// live in WorkspaceHeader (which spans this column and the Inspector), so
// this component is purely the working surface.
export default function DesignCanvas({
  project,
  activeVersion,
  generations,
  versionOf,
  activeVersionId,
  onSelectVersion,
  selectedObjectId,
  onSelectObject,
  onFullscreen,
  onNewVersion,
  onCompare,
  compareCount,
  referenceVersion,
  analyzing,
  exported,
  copilotProps,
}) {
  const [tool, setTool] = useState('select')
  const [showPins, setShowPins] = useState(true)

  return (
    <>
      <CanvasStepper project={project} activeVersion={activeVersion} analyzing={analyzing} exported={exported} />

      <CanvasStage
        version={activeVersion}
        tool={tool}
        onToolChange={setTool}
        showPins={showPins}
        onTogglePins={() => setShowPins((v) => !v)}
        selectedObjectId={selectedObjectId}
        onSelectObject={onSelectObject}
        onFullscreen={onFullscreen}
        onCompare={onCompare}
        compareCount={compareCount}
        referenceVersion={referenceVersion}
        versionOf={versionOf}
        onSelectVersion={onSelectVersion}
        filmstrip={
          <VersionFilmstrip
            generations={generations}
            activeVersionId={activeVersionId}
            onSelect={onSelectVersion}
            versionOf={versionOf}
            onNewVersion={onNewVersion}
          />
        }
      />

      <CopilotBar {...copilotProps} />
    </>
  )
}
