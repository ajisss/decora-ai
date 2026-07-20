// Small inline spinner shared by the analysis surfaces.
export default function Spinner({ className = 'h-3 w-3' }) {
  return (
    <svg className={`${className} shrink-0 animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
