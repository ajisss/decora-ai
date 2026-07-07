import { StepIcon } from '../icons.jsx'

export default function EmptyState({ hint }) {
  return (
    <div className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed border-paper-line bg-paper-soft px-6 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink-muted ring-1 ring-paper-line">
        <StepIcon name="spark" className="h-5 w-5" />
      </span>
      <p className="text-sm text-ink-muted">{hint}</p>
    </div>
  )
}
