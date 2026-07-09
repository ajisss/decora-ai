// Empty state = ilustrasi + penjelasan + CTA (uiuxcontext §11). Ilustrasi
// line-art inline mengikuti gaya ikon existing (stroke 1.6, warna clay/ink-muted).
const ILLUSTRATIONS = {
  // Bingkai foto/kanvas dengan kilau — untuk "belum ada desain/proyek".
  canvas: (
    <svg viewBox="0 0 96 96" fill="none" className="h-24 w-24" aria-hidden="true">
      <rect x="14" y="20" width="68" height="52" rx="6" stroke="#ece8e2" strokeWidth="3" />
      <rect x="22" y="28" width="52" height="36" rx="3" stroke="#c05f3c" strokeOpacity="0.45" strokeWidth="2.5" />
      <path d="m28 58 12-13 9 9 7-7 12 11" stroke="#c05f3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="38" cy="38" r="4" stroke="#c05f3c" strokeWidth="2.5" />
      <path d="M76 12v8M72 16h8M20 8v6M17 11h6" stroke="#c05f3c" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  // Daftar centang — untuk "belum ada item checklist".
  checklist: (
    <svg viewBox="0 0 96 96" fill="none" className="h-24 w-24" aria-hidden="true">
      <rect x="24" y="14" width="48" height="68" rx="6" stroke="#ece8e2" strokeWidth="3" />
      <path d="m33 34 4 4 7-8" stroke="#c05f3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M50 34h13" stroke="#78726a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="m33 52 4 4 7-8" stroke="#c05f3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M50 52h13" stroke="#78726a" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="37" cy="68" r="4" stroke="#ece8e2" strokeWidth="2.5" />
      <path d="M50 68h13" stroke="#78726a" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
}

export default function EmptyState({ illustration = 'canvas', title, body, cta, onCta, compact = false }) {
  return (
    <div className={`flex flex-col items-center gap-3 text-center ${compact ? 'py-6' : 'py-14'}`}>
      {ILLUSTRATIONS[illustration]}
      <h2 className={`font-display font-semibold text-ink ${compact ? 'text-base' : 'text-xl'}`}>{title}</h2>
      {body && <p className="max-w-[42ch] text-sm text-ink-muted">{body}</p>}
      {cta && (
        <button type="button" onClick={onCta} className="btn-primary mt-2">
          {cta}
        </button>
      )}
    </div>
  )
}
