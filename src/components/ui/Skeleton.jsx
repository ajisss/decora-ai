// Shaped loading placeholders (ux-spec §3.5). Shape drives the rendered form.
export default function Skeleton({ shape = 'text-line', className = '' }) {
  const base = 'animate-pulse bg-paper-soft'
  if (shape === 'card') {
    return (
      <div className={`rounded-xl2 border border-paper-line p-4 ${className}`}>
        <div className={`${base} mb-3 aspect-[4/3] rounded-lg`} />
        <div className={`${base} mb-2 h-4 w-3/4 rounded`} />
        <div className={`${base} h-3 w-1/2 rounded`} />
      </div>
    )
  }
  if (shape === 'image-block') {
    return <div className={`${base} aspect-[4/3] rounded-lg ${className}`} />
  }
  if (shape === 'checklist-row') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`${base} h-5 w-5 rounded-sm`} />
        <div className="flex-1">
          <div className={`${base} mb-1.5 h-3.5 w-1/2 rounded`} />
          <div className={`${base} h-3 w-3/4 rounded`} />
        </div>
      </div>
    )
  }
  return <div className={`${base} h-3 w-full rounded ${className}`} />
}
