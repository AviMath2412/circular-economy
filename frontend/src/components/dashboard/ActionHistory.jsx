import { useEffect, useState } from 'react'
import { getActionHistory, deleteActionLog } from '../../services/recommendationService'
import LoadingSpinner from '../common/LoadingSpinner'

const ACTION_META = {
  reuse:     { label: 'Reuse',           icon: '🔄' },
  repair:    { label: 'Repair',          icon: '🔧' },
  refurbish: { label: 'Refurbish',       icon: '⚙️' },
  resell:    { label: 'Resell',          icon: '🏷️' },
  recycle:   { label: 'Recycle',         icon: '♻️' },
  recover:   { label: 'Energy Recovery', icon: '⚡' },
  dispose:   { label: 'Safe Disposal',   icon: '🗑️' },
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ActionHistory() {
  const [logs, setLogs]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)

  const load = () => {
    setLoading(true)
    getActionHistory()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRemove = async (logId) => {
    if (!window.confirm('Remove this completion record?')) return
    setRemoving(logId)
    try {
      await deleteActionLog(logId)
      setLogs((prev) => prev.filter((l) => l.id !== logId))
    } catch (err) {
      console.error(err)
    } finally {
      setRemoving(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading action history" />

  return (
    <div className="bg-white border border-forest/10 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-forest/10">
        <div>
          <h2 className="font-semibold text-forest-dark text-base">Completed Circular Actions</h2>
          <p className="text-xs text-ink/55 mt-0.5">Your logged circular economy activities</p>
        </div>
        <span className="text-xs font-bold bg-forest/10 text-forest px-2.5 py-1 rounded-full">
          {logs?.length ?? 0} logged
        </span>
      </div>

      {!logs || logs.length === 0 ? (
        <div className="text-center py-10 text-sm text-ink/50">
          <p className="text-2xl mb-2">📋</p>
          <p>No completed actions yet.</p>
          <p className="text-xs mt-1 text-ink/40">
            Go to a product's recommendations and click "Mark as Completed".
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-forest/5">
          {logs.map((log) => {
            const meta = ACTION_META[log.action_type] || { label: log.action_type, icon: '📦' }
            return (
              <li key={log.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-sage/30 transition group">
                <span className="text-xl mt-0.5">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-forest-dark">{log.product_name}</span>
                    <span className="text-xs bg-forest/10 text-forest font-semibold px-2 py-0.5 rounded-full">
                      {meta.label}
                    </span>
                  </div>
                  {log.notes && (
                    <p className="text-xs text-ink/60 mt-0.5 truncate">{log.notes}</p>
                  )}
                  <p className="text-[11px] text-ink/40 mt-1">{formatDate(log.completed_at)}</p>
                </div>
                <button
                  onClick={() => handleRemove(log.id)}
                  disabled={removing === log.id}
                  className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition disabled:opacity-50 shrink-0 cursor-pointer"
                  title="Undo / remove"
                >
                  {removing === log.id ? '…' : '✕'}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

