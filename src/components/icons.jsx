// SVG ikon minimal, stroke-based, konsisten dengan mood clean.
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
}

export function StepIcon({ name, className = 'h-6 w-6' }) {
  const paths = {
    brief: (
      <>
        <path d="M8 4h8a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z" />
        <path d="M9 9h6M9 13h4" />
      </>
    ),
    triage: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" />
      </>
    ),
    produce: (
      <>
        <path d="M4 20h16" />
        <path d="M6 20V9l6-4 6 4v11" />
        <path d="M10 20v-5h4v5" />
      </>
    ),
    preview: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    revise: (
      <>
        <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" />
        <path d="M20 4v4h-4" />
        <path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" />
        <path d="M4 20v-4h4" />
      </>
    ),
    deliver: (
      <>
        <path d="M12 3v12" />
        <path d="M8 11l4 4 4-4" />
        <path d="M5 21h14" />
      </>
    ),
    check: <path d="M20 6 9 17l-5-5" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    spark: (
      <>
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
        <path d="M12 8l1.2 2.8L16 12l-2.8 1.2L12 16l-1.2-2.8L8 12l2.8-1.2Z" />
      </>
    ),
    close: <path d="M6 6l12 12M18 6 6 18" />,
    image: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="m4 17 5-5 4 4 3-3 4 4" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16" />
        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
      </>
    ),
  }
  return (
    <svg {...base} className={className} aria-hidden="true">
      {paths[name] ?? null}
    </svg>
  )
}
