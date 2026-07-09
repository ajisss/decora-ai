import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../components/shell/AppShell.jsx'
import ChipGroup from '../components/wizard/ChipGroup.jsx'
import SegmentedControl from '../components/wizard/SegmentedControl.jsx'
import StepperInput from '../components/wizard/StepperInput.jsx'
import PalettePicker from '../components/wizard/PalettePicker.jsx'
import ReferenceImageInput from '../components/generator/ReferenceImageInput.jsx'
import { useProjects } from '../context/ProjectsContext.jsx'
import { api } from '../api/client.js'
import { content } from '../content.js'

const t = content.app.wizard
const DRAFT_KEY = 'decor-ai:wizard-draft'
// Nilai chip sengaja tetap bahasa Inggris — nilainya masuk langsung ke prompt
// image model (kualitas hasil lebih konsisten dalam EN); hanya label UI yang ID.
const THEMES = ['Rustic', 'Modern', 'Traditional', 'Garden', 'Glamorous', 'Bohemian', 'Minimalist']
const STYLES = ['Romantic', 'Elegant', 'Playful', 'Dramatic', 'Natural']
const VENUES = ['Indoor ballroom', 'Garden / outdoor', 'Beach', 'Rooftop', 'Traditional hall', 'Tent / marquee']

function readDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function defaultDraft(teaserNotes, teaserReference) {
  return {
    name: t.defaultName,
    theme: '',
    customTheme: '',
    style: '',
    venueType: '',
    customVenue: '',
    venueSize: 'Medium',
    guestCapacity: 200,
    budgetTier: 'Standard',
    colorPalette: [],
    notes: teaserNotes ?? '',
    referenceImage: teaserReference ?? null,
  }
}

// T2: prefill the form from an existing project's setup when editing in place.
// A saved setup holds final values (not preset keys), so anything not in the
// curated list is treated as a custom entry.
function draftFromProject(project) {
  const s = project.setup ?? {}
  return {
    name: project.name,
    theme: THEMES.includes(s.theme) ? s.theme : 'Custom…',
    customTheme: THEMES.includes(s.theme) ? '' : s.theme ?? '',
    style: s.style ?? '',
    venueType: VENUES.includes(s.venueType) ? s.venueType : 'Custom…',
    customVenue: VENUES.includes(s.venueType) ? '' : s.venueType ?? '',
    venueSize: s.venueSize ?? 'Medium',
    guestCapacity: s.guestCapacity ?? 200,
    budgetTier: s.budgetTier ?? 'Standard',
    colorPalette: s.colorPalette ?? [],
    notes: s.notes ?? '',
    referenceImage: null,
  }
}

export default function WizardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { createProject, updateProject, getProject } = useProjects()
  const teaserNotes = location.state?.teaserNotes
  const teaserReference = location.state?.teaserReference
  const editProjectId = location.state?.editProjectId
  const editProject = editProjectId ? getProject(editProjectId) : null

  const [draft, setDraft] = useState(() =>
    editProject ? draftFromProject(editProject) : readDraft() ?? defaultDraft(teaserNotes, teaserReference),
  )
  const [view, setView] = useState('form') // 'form' | 'preview'
  const [errors, setErrors] = useState({})
  const [prompt, setPrompt] = useState('')
  const [promptDirty, setPromptDirty] = useState(false)
  const [compiledForSnapshot, setCompiledForSnapshot] = useState('')
  const [showRecompileBanner, setShowRecompileBanner] = useState(false)
  const [creating, setCreating] = useState(false)
  const themeGroupRef = useRef(null)
  const venueGroupRef = useRef(null)

  useEffect(() => {
    if (editProjectId) return // edit mode doesn't share the golden-path draft slot
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [draft, editProjectId])

  const setField = (field) => (val) => setDraft((d) => ({ ...d, [field]: val }))

  const setup = useMemo(
    () => ({
      theme: draft.theme === 'Custom…' ? draft.customTheme : draft.theme,
      style: draft.style,
      venueType: draft.venueType === 'Custom…' ? draft.customVenue : draft.venueType,
      venueSize: draft.venueSize,
      guestCapacity: draft.guestCapacity,
      budgetTier: draft.budgetTier,
      colorPalette: draft.colorPalette,
      notes: draft.notes,
    }),
    [draft],
  )

  const setupSnapshot = JSON.stringify(setup)

  const validate = () => {
    const next = {}
    if (!setup.theme) next.theme = t.themeError
    if (!setup.venueType) next.venueType = t.venueError
    setErrors(next)
    return next
  }

  const goToPreview = async () => {
    const next = validate()
    if (next.theme) return themeGroupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (next.venueType) return venueGroupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

    if (promptDirty && compiledForSnapshot !== setupSnapshot) {
      setShowRecompileBanner(true)
      setView('preview')
      return
    }

    const { prompt: compiled } = await api.previewPrompt(setup)
    setPrompt(compiled)
    setCompiledForSnapshot(setupSnapshot)
    setPromptDirty(false)
    setShowRecompileBanner(false)
    setView('preview')
  }

  const recompile = async () => {
    const { prompt: compiled } = await api.previewPrompt(setup)
    setPrompt(compiled)
    setCompiledForSnapshot(setupSnapshot)
    setPromptDirty(false)
    setShowRecompileBanner(false)
  }

  const handleGenerate = async () => {
    setCreating(true)
    let referenceImageId = editProject?.setup?.referenceImageId ?? null
    try {
      if (draft.referenceImage) {
        const { referenceImageId: id } = await api.upload(draft.referenceImage)
        referenceImageId = id
      }
    } catch {
      /* upload failure: proceed without reference rather than blocking generation */
    }

    if (editProjectId) {
      // T2: edit mode updates setup + prompt in place; it never creates a
      // generation itself — changes apply the next time Generate is clicked.
      updateProject(editProjectId, (p) => ({
        ...p,
        name: draft.name,
        setup: { ...setup, referenceImageId },
        prompt,
      }))
      navigate(`/studio/${editProjectId}`, { state: { setupUpdated: true } })
      return
    }

    const project = createProject({
      name: draft.name,
      setup: { ...setup, referenceImageId },
      prompt,
    })
    sessionStorage.removeItem(DRAFT_KEY)
    navigate(`/studio/${project.id}`, { state: { autorun: true } })
  }

  if (view === 'preview') {
    return (
      <AppShell>
        <div className="mx-auto max-w-[640px] px-6 py-12">
          <button
            type="button"
            onClick={() => setView('form')}
            className="mb-6 text-sm font-medium text-ink-soft hover:text-ink"
          >
            {t.backToForm}
          </button>
          <p className="eyebrow mb-2">{t.promptEyebrow}</p>
          {showRecompileBanner && (
            <div className="mb-3 rounded-lg border border-clay/30 bg-clay-soft px-4 py-3 text-sm text-clay-deep">
              {t.recompileBanner}{' '}
              <button type="button" onClick={recompile} className="font-semibold underline">
                {t.recompileAction}
              </button>{' '}
              {t.recompileKeep}
            </div>
          )}
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value)
              setPromptDirty(true)
              setShowRecompileBanner(false)
            }}
            maxLength={2000}
            rows={6}
            className="w-full rounded-lg border border-paper-line bg-paper p-3 text-sm focus:border-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
          />
          <p className="mt-1.5 text-right text-xs text-ink-muted">{prompt.length}/2000</p>
          {draft.referenceImage && (
            <img src={draft.referenceImage} alt="Reference" className="mt-3 h-20 w-20 rounded-lg object-cover" />
          )}
          <p className="mt-3 text-sm text-ink-muted">
            {t.promptNote}
          </p>
          <div className="mt-8 flex justify-end">
            <button type="button" onClick={handleGenerate} disabled={creating} className="btn-primary disabled:opacity-50">
              {creating ? t.creating : editProjectId ? t.saveChanges : t.generate}
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  // W3: stale edit link (project deleted in another tab) -> Not-found, never a blank form.
  if (editProjectId && !editProject) {
    return (
      <AppShell>
        <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center">
          <h1 className="font-display text-2xl text-ink">{t.notFound}</h1>
          <button type="button" onClick={() => navigate('/projects')} className="btn-primary">
            {t.backToProjects}
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell projectName={editProject?.name}>
      <div className="mx-auto max-w-[640px] px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink">
          {editProjectId ? t.editTitle : t.title}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          {t.sub}
        </p>
        {teaserNotes && (
          <p className="mt-4 rounded-lg bg-clay-soft px-4 py-3 text-sm text-clay-deep">
            {t.teaserNotice}
          </p>
        )}

        <div className="mt-8">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t.nameLabel}</span>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setField('name')(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="h-10 w-full rounded-lg border border-paper-line bg-paper px-3 text-sm focus:border-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
          />
        </div>

        <div className="mt-8 space-y-6 border-t border-paper-line pt-6">
          <h2 className="font-display text-xl font-semibold text-ink">{t.sectionWedding}</h2>
          <div ref={themeGroupRef}>
            <ChipGroup
              label={t.themeLabel}
              options={THEMES}
              value={draft.theme}
              onChange={setField('theme')}
              allowCustom
              customValue={draft.customTheme}
              onCustomChange={setField('customTheme')}
              error={errors.theme}
            />
          </div>
          <ChipGroup label={t.styleLabel} options={STYLES} value={draft.style} onChange={setField('style')} />
        </div>

        <div className="mt-8 space-y-6 border-t border-paper-line pt-6">
          <h2 className="font-display text-xl font-semibold text-ink">{t.sectionVenue}</h2>
          <div ref={venueGroupRef}>
            <ChipGroup
              label={t.venueLabel}
              options={VENUES}
              value={draft.venueType}
              onChange={setField('venueType')}
              allowCustom
              customValue={draft.customVenue}
              onCustomChange={setField('customVenue')}
              error={errors.venueType}
            />
          </div>
          <SegmentedControl
            label={t.venueSizeLabel}
            options={['Small', 'Medium', 'Large']}
            value={draft.venueSize}
            onChange={setField('venueSize')}
          />
          <StepperInput label={t.guestLabel} value={draft.guestCapacity} onChange={setField('guestCapacity')} />
        </div>

        <div className="mt-8 space-y-6 border-t border-paper-line pt-6">
          <h2 className="font-display text-xl font-semibold text-ink">{t.sectionLook}</h2>
          <SegmentedControl
            label={t.budgetLabel}
            options={['Economy', 'Standard', 'Premium', 'Luxury']}
            value={draft.budgetTier}
            onChange={setField('budgetTier')}
            helper={t.budgetHelper}
          />
          <PalettePicker value={draft.colorPalette} onChange={setField('colorPalette')} />
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">{t.notesLabel}</span>
            <textarea
              value={draft.notes}
              onChange={(e) => setField('notes')(e.target.value.slice(0, 500))}
              placeholder={t.notesPlaceholder}
              rows={3}
              className="w-full rounded-lg border border-paper-line bg-paper p-3 text-sm focus:border-clay focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
            />
            {draft.notes.length > 400 && (
              <p className="mt-1 text-right text-xs text-ink-muted">{draft.notes.length}/500</p>
            )}
          </div>
          <ReferenceImageInput value={draft.referenceImage} onChange={setField('referenceImage')} />
        </div>

        <div className="sticky bottom-0 mt-10 flex items-center justify-between border-t border-paper-line bg-paper py-4">
          <button
            type="button"
            onClick={() => navigate(editProjectId ? `/studio/${editProjectId}` : '/projects')}
            className="btn-ghost"
          >
            {t.cancel}
          </button>
          <button type="button" onClick={goToPreview} className="btn-primary">
            {t.preview}
          </button>
        </div>
      </div>
    </AppShell>
  )
}
