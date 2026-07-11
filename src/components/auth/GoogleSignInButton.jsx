import { useState } from 'react'

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', reject)
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// "Lanjutkan dengan Google" — lazily loads Google Identity Services only on
// click. If VITE_GOOGLE_CLIENT_ID isn't configured, fails fast with an inline
// error instead of attempting to load Google's script at all.
export default function GoogleSignInButton({ label, disabled, onCredential, onError }) {
  const [loading, setLoading] = useState(false)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

  const handleClick = async () => {
    if (!clientId) {
      onError('Google Sign-In belum dikonfigurasi.')
      return
    }
    setLoading(true)
    try {
      await loadGoogleScript()
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          setLoading(false)
          onCredential(response.credential)
        },
      })
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setLoading(false)
          onError('Google Sign-In dibatalkan atau diblokir browser.')
        }
      })
    } catch {
      setLoading(false)
      onError('Gagal memuat Google Sign-In. Cek koneksimu.')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className="btn-ghost w-full disabled:opacity-60"
    >
      <GoogleMark />
      {loading ? '…' : label}
    </button>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.1 3.7-8.6z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5l-3.9 3C3.3 21.3 7.3 24 12 24z"
      />
      <path fill="#FBBC05" d="M5.1 14.4a7 7 0 0 1 0-4.7l-3.9-3a12 12 0 0 0 0 10.7l3.9-3z" />
      <path
        fill="#EA4335"
        d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17 1.1 15.2 0 12 0 7.3 0 3.3 2.7 1.2 6.7l3.9 3c1-2.9 3.7-5 6.9-5z"
      />
    </svg>
  )
}
