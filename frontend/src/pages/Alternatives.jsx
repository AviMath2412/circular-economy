import { useEffect, useState } from 'react'
import * as alternativeService from '../services/alternativeService'
import * as productService from '../services/productService'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function Alternatives() {
  const [alternatives, setAlternatives] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTier, setSelectedTier] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (selectedCategory) params.category_id = selectedCategory
    if (selectedTier) params.price_tier = selectedTier

    alternativeService
      .getAlternatives(params)
      .then(setAlternatives)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedCategory, selectedTier])

  const filtered = alternatives.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.name.toLowerCase().includes(q) ||
      a.brand?.toLowerCase().includes(q) ||
      a.circular_feature.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-forest/10 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <h1 className="text-2xl font-bold text-forest-dark">Sustainable Alternatives Catalog</h1>
          </div>
          <p className="text-sm text-ink/65 mt-1">
            Curated circular-designed items engineered for longevity, modular repair, and closed-loop recyclability.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-forest/10 border border-forest/20 text-forest text-xs font-bold shrink-0">
          SDG 12: Target 12.5 (Waste Prevention)
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-forest/10 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by brand, feature, or keyword…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs sm:text-sm border border-forest/20 rounded-lg px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-forest/40 bg-sage/20"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs sm:text-sm border border-forest/20 rounded-lg px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-forest/40"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Price Tier */}
        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          className="text-xs sm:text-sm border border-forest/20 rounded-lg px-3 py-2 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-forest/40"
        >
          <option value="">All Price Tiers</option>
          <option value="Budget">Budget</option>
          <option value="Moderate">Moderate</option>
          <option value="Premium">Premium</option>
        </select>

        {(selectedCategory || selectedTier || search) && (
          <button
            onClick={() => { setSelectedCategory(''); setSelectedTier(''); setSearch('') }}
            className="text-xs font-semibold text-amber-dark hover:underline cursor-pointer px-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner label="Loading circular catalog" />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-forest/10 p-12 text-center text-sm text-ink/60">
          <p className="text-3xl mb-2">🔍</p>
          No alternatives match your current search criteria.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((alt) => (
            <div
              key={alt.id}
              className="bg-white border border-forest/15 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-forest/40 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-amber-dark tracking-wider uppercase">
                    {alt.brand || 'Eco-Brand'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20">
                    {alt.price_tier}
                  </span>
                </div>

                <h3 className="text-base font-bold text-forest-dark mb-1">{alt.name}</h3>

                <div className="inline-block bg-forest/5 text-forest text-[11px] font-semibold px-2 py-0.5 rounded-md mb-2.5 border border-forest/15">
                  ✨ {alt.circular_feature}
                </div>

                <p className="text-xs text-ink/70 leading-relaxed mb-4">
                  {alt.description}
                </p>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-forest/10 text-xs mb-3 font-semibold">
                  <div className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md text-center">
                    🌱 -{alt.co2_reduction_pct}% CO₂
                  </div>
                  <div className="text-forest-dark bg-sage/60 px-2 py-1 rounded-md text-center">
                    ⏳ {alt.lifespan_multiplier}x Lifespan
                  </div>
                </div>

                {alt.resource_url && (
                  <a
                    href={alt.resource_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-xs font-semibold text-white bg-forest hover:bg-forest-dark py-2 rounded-lg transition shadow-xs"
                  >
                    Learn More ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

