import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

// Single-slot toast queue: bottom-center, 4s auto-dismiss, optional action (ux-spec §3.4).
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback((message, { action, duration = 4000 } = {}) => {
    clearTimeout(timerRef.current)
    const id = Math.random().toString(36).slice(2)
    setToast({ id, message, action })
    if (!action || duration) {
      timerRef.current = setTimeout(() => {
        setToast((t) => (t?.id === id ? null : t))
      }, action ? action.duration ?? 6000 : duration)
    }
  }, [])

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current)
    setToast(null)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, dismiss }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-[400px] -translate-x-1/2 px-4">
          <div
            role="status"
            className="flex items-center justify-between gap-4 rounded-xl2 bg-ink px-4 py-3 text-sm text-white shadow-2xl"
            onClick={dismiss}
          >
            <span>{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                className="font-semibold text-clay-soft hover:underline"
                onClick={(e) => {
                  e.stopPropagation()
                  toast.action.onClick()
                  dismiss()
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
