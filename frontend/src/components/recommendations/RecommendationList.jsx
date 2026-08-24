import { useEffect, useState, useCallback } from 'react'
import * as recommendationService from '../../services/recommendationService'
import RecommendationCard from './RecommendationCard'
import LoadingSpinner from '../common/LoadingSpinner'

export default function RecommendationList({ productId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await recommendationService.getRecommendations(productId)
      setData(res)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Failed to compute or load recommendations.')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  const regenerate = async () => {
    try {
      setRegenerating(true)
      await recommendationService.generateRecommendations(productId)
      await load()
    } catch (err) {
      console.error(err)
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) return <LoadingSpinner label="Scoring circular economy actions" />

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
        {error}
      </div>
    )
  }

  if (!data || !data.actions || data.actions.length === 0) {
    return (
      <div className="text-center py-8 bg-white border border-forest/10 rounded-xl p-4 text-sm text-ink/60">
        No circular recommendations available.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-forest/10">
        <div>
          <h2 className="font-semibold text-forest-dark text-base">Circular Action Rankings</h2>
          <p className="text-xs text-ink/60">
            Ranked by multi-criteria fit (Condition, Material Recyclability/Repairability, Age Ratio, CO₂ Impact).
          </p>
        </div>
        <button
          onClick={regenerate}
          disabled={regenerating}
          className="text-xs sm:text-sm text-amber-dark font-semibold border border-amber/30 bg-amber/10 px-3.5 py-1.5 rounded-lg hover:bg-amber/20 disabled:opacity-50 transition shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <span>🔄</span>
          <span>{regenerating ? 'Recalculating…' : 'Recalculate'}</span>
        </button>
      </div>

      <div className="space-y-3">
        {data.actions.map((a) => (
          <RecommendationCard key={a.id} action={a} />
        ))}
      </div>
    </div>
  )
}
