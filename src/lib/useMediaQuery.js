import { useEffect, useState } from 'react'

// Subscribes to a CSS media query. Extracted from the copy that lived inline in
// AppSidebar so the workspace shell and the sidebar agree on one source of
// truth for breakpoints instead of each running their own matchMedia listener.
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatches(mq.matches)
    on()
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [query])

  return matches
}
