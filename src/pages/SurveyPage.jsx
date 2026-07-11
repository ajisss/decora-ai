import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { content } from '../content.js'
import { useAuth } from '../context/AuthContext.jsx'
import { StepIcon } from '../components/icons.jsx'

// One-time post-signup survey — reached only via explicit navigation right
// after a new account is created (register or first-time Google sign-in),
// never as a persistent route gate. Skipping has the same downstream effect
// as answering: the app never routes here again this flow.
export default function SurveyPage() {
  const { submitSurvey } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const s = content.app.survey
  const [submitting, setSubmitting] = useState(null) // holds the goal being submitted, or null

  const from = location.state?.from ?? '/projects'

  const choose = async (goal) => {
    setSubmitting(goal)
    try {
      await submitSurvey(goal)
    } catch {
      /* best-effort — don't block the user from continuing into the app */
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-soft px-6">
      <div className="w-full max-w-[480px] text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">{s.title}</h1>
        <p className="mt-1.5 text-sm text-ink-muted">{s.sub}</p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { goal: 'calon_pengantin', icon: 'star', label: s.optionCoupleLabel, hint: s.optionCoupleHint },
            { goal: 'vendor', icon: 'store', label: s.optionVendorLabel, hint: s.optionVendorHint },
          ].map((opt) => (
            <button
              key={opt.goal}
              type="button"
              onClick={() => choose(opt.goal)}
              disabled={submitting !== null}
              className="flex flex-col items-center gap-2 rounded-xl2 border border-paper-line bg-paper p-6 text-center transition-colors hover:border-clay/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-clay-soft text-clay-deep">
                <StepIcon name={opt.icon} className="h-5 w-5" />
              </span>
              <span className="font-medium text-ink">{opt.label}</span>
              <span className="text-xs text-ink-muted">{opt.hint}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate(from, { replace: true })}
          disabled={submitting !== null}
          className="mt-6 text-sm font-medium text-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {s.skip}
        </button>
      </div>
    </div>
  )
}
