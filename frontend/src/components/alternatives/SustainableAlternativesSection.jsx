import { useEffect, useState } from 'react'
import * as alternativeService from '../../services/alternativeService'
import LoadingSpinner from '../common/LoadingSpinner'

export default function SustainableAlternativesSection({ productId, categoryName }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!productId) return
    alternativeService
      .getProductAlternatives(productId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [productId])

  if (loading) return <LoadingSpinner label="Matching circular alternatives" />

  const alternatives = data?.alternatives || []
  if (alternatives.length === 0) return null

  return (
    <div className="bg-white border border-forest/15 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-forest/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">♻️</span>
            <h3 className="font-bold text-forest-dark text-base">
              Circular Alternatives for {categoryName || 'this Category'}
            </h3>
          </div>
          <p className="text-xs text-ink/65 mt-0.5">
            If retiring this product, choose circular-designed alternatives with modular repairability and closed-loop recyclability.
          </p>
        </div>
        <span className="text-xs font-semibold bg-forest/10 text-forest px-2.5 py-1 rounded-full border border-forest/20 shrink-0">
          SDG 12: Responsible Consumption
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 pt-1">
        {alternatives.map((alt) => (
          <div
            key={alt.id}
            className="border border-forest/15 bg-sage/20 rounded-xl p-4 flex flex-col justify-between hover:border-forest/40 hover:bg-sage/40 transition-all shadow-2xs"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-1.5">
                <div>
                  {alt.brand && (
                    <span className="text-[11px] font-bold text-amber-dark tracking-wide uppercase">
                      {alt.brand}
                    </span>
                  )}
                  <h4 className="font-semibold text-forest-dark text-sm">{alt.name}</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20 shrink-0">
                  {alt.price_tier}
                </span>
              </div>

              <div className="inline-block bg-white text-forest-dark border border-forest/20 text-[11px] font-medium px-2 py-0.5 rounded-md mb-2 shadow-2xs">
                ✨ {alt.circular_feature}
              </div>

              <p className="text-xs text-ink/75 leading-relaxed mb-3">
                {alt.description}
              </p>
            </div>

            <div className="pt-2 border-t border-forest/10 flex items-center justify-between text-xs font-semibold">
              <span className="text-emerald-700 flex items-center gap-1">
                <span>🌱</span>
                <span>-{alt.co2_reduction_pct}% CO₂ vs virgin</span>
              </span>
              <span className="text-forest-dark flex items-center gap-1">
                <span>⏳</span>
                <span>{alt.lifespan_multiplier}x lifespan</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

