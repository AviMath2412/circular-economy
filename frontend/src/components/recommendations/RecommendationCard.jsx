import { useState } from 'react'
import { completeAction } from '../../services/recommendationService'

const ACTION_META = {
  reuse:       { label: 'Reuse',           icon: '🔄', color: 'text-emerald-700' },
  repair:      { label: 'Repair',          icon: '🔧', color: 'text-blue-700'    },
  refurbish:   { label: 'Refurbish',       icon: '⚙️',  color: 'text-indigo-700' },
  resell:      { label: 'Resell',          icon: '🏷️', color: 'text-amber-800'  },
  recycle:     { label: 'Recycle',         icon: '♻️',  color: 'text-teal-700'   },
  recover:     { label: 'Energy Recovery', icon: '⚡', color: 'text-purple-700' },
  dispose:     { label: 'Safe Disposal',   icon: '🗑️', color: 'text-stone-600'  },
}

export default function RecommendationCard({ action, onCompleted }) {
  const meta = ACTION_META[action.action_type] || { label: action.action_type, icon: '📦', color: 'text-forest' }
  const [showNotes, setShowNotes]   = useState(false)
  const [notes, setNotes]           = useState('')
  const [logging, setLogging]       = useState(false)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState(null)

  const handleComplete = async () => {
    setLogging(true)
    setError(null)
    try {
      await completeAction(action.id, notes)
      setDone(true)
      setShowNotes(false)
      if (onCompleted) onCompleted()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to log action')
    } finally {
      setLogging(false)
    }
  }

  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        action.is_recommended
          ? 'border-forest bg-forest/5 shadow-sm ring-1 ring-forest/30'
          : 'border-forest/15 bg-white hover:border-forest/30'
      }`}
    >
      {/* Header row */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{meta.icon}</span>
          <span className="font-semibold text-forest-dark text-base">{meta.label}</span>
          {action.is_recommended && (
            <span className="text-xs bg-forest text-white font-medium px-2.5 py-0.5 rounded-full shadow-xs">
              ★ Top Recommendation
            </span>
          )}
          {done && (
            <span className="text-xs bg-emerald-100 text-emerald-700 font-medium px-2.5 py-0.5 rounded-full border border-emerald-200">
              ✓ Logged
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-forest">{action.recommendation_score}</span>
          <span className="text-xs text-ink/40 font-medium">/ 100</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full bg-forest/15 rounded-full h-2 overflow-hidden my-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            action.is_recommended ? 'bg-forest' : 'bg-forest/70'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, action.recommendation_score))}%` }}
        />
      </div>

      {/* Environmental impact metrics */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-forest/10 text-xs">
        <div className="flex items-center gap-1.5 text-ink/75">
          <span className="text-forest font-bold">🌱</span>
          <span>
            <strong>~{action.environmental_impact.estimated_co2_savings_kg} kg</strong> CO₂ saved
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-ink/75">
          <span className="text-forest font-bold">📦</span>
          <span>
            <strong>~{action.environmental_impact.estimated_landfill_diverted_kg} kg</strong> diverted
          </span>
        </div>
      </div>

      {/* Mark as Completed */}
      {!done && (
        <div className="mt-3 pt-3 border-t border-forest/10">
          {!showNotes ? (
            <button
              onClick={() => setShowNotes(true)}
              className="text-xs font-medium text-forest border border-forest/30 bg-forest/5 hover:bg-forest/10 px-3 py-1.5 rounded-lg transition cursor-pointer"
            >
              ✓ Mark as Completed
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes (e.g. 'Repaired by local shop', 'Donated to charity')…"
                className="w-full text-xs rounded-lg border border-forest/20 bg-sage/30 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-forest/40 resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleComplete}
                  disabled={logging}
                  className="text-xs font-semibold text-white bg-forest hover:bg-forest-dark px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {logging ? 'Saving…' : 'Confirm'}
                </button>
                <button
                  onClick={() => { setShowNotes(false); setNotes('') }}
                  className="text-xs text-ink/50 hover:text-ink transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
