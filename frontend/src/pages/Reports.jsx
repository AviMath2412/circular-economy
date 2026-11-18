import { useEffect, useState } from 'react'
import * as reportService from '../services/reportService'
import * as productService from '../services/productService'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function Reports() {
  const [summary, setSummary] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCat, setSelectedCat] = useState('')
  const [exporting, setExporting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      reportService.getReportSummary(),
      productService.getCategories(),
    ])
      .then(([rep, cats]) => {
        setSummary(rep)
        setCategories(cats)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleExport = async () => {
    try {
      setExporting(true)
      await reportService.downloadReportCsv(selectedCat ? Number(selectedCat) : null)
    } catch (err) {
      console.error(err)
      alert('Failed to export CSV report')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Generating sustainability intelligence" />

  const pathways = summary?.pathway_breakdown || {}
  const conditions = summary?.condition_distribution || {}

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-forest/10 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h1 className="text-2xl font-bold text-forest-dark">Sustainability Analytics & Reports</h1>
          </div>
          <p className="text-sm text-ink/65 mt-1">
            Quantified carbon avoidance, circular pathway metrics, and exportable audit reports.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="text-xs sm:text-sm border border-forest/20 rounded-lg px-3 py-2 bg-white text-ink focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="bg-forest text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-forest-dark transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <span>📥</span>
            <span>{exporting ? 'Generating CSV…' : 'Export CSV Report'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-forest/10 shadow-xs">
          <div className="text-xs font-semibold text-ink/55 uppercase tracking-wider">Tracked Assets</div>
          <div className="text-2xl font-bold text-forest-dark mt-2">{summary?.total_products || 0}</div>
          <div className="text-[11px] text-ink/45 mt-1">Products in portfolio</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-forest/10 shadow-xs">
          <div className="text-xs font-semibold text-ink/55 uppercase tracking-wider">Avg Condition</div>
          <div className="text-2xl font-bold text-forest mt-2">{summary?.avg_condition || 0} <span className="text-xs text-ink/40 font-normal">/ 10</span></div>
          <div className="text-[11px] text-ink/45 mt-1">Assessed via CV heuristics</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-forest/10 shadow-xs">
          <div className="text-xs font-semibold text-ink/55 uppercase tracking-wider">Avoided CO₂</div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">~{summary?.total_co2_kg || 0} <span className="text-xs text-ink/40 font-normal">kg</span></div>
          <div className="text-[11px] text-ink/45 mt-1">Virgin extraction saved</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-forest/10 shadow-xs">
          <div className="text-xs font-semibold text-ink/55 uppercase tracking-wider">Landfill Diverted</div>
          <div className="text-2xl font-bold text-amber-dark mt-2">~{summary?.total_landfill_diverted_kg || 0} <span className="text-xs text-ink/40 font-normal">kg</span></div>
          <div className="text-[11px] text-ink/45 mt-1">Municipal waste prevented</div>
        </div>
      </div>

      {/* Detailed Circular Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pathway Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-forest/10 shadow-sm space-y-4">
          <h3 className="font-bold text-forest-dark text-base flex items-center gap-2">
            <span>🔄</span>
            <span>Recommended Circular Pathways</span>
          </h3>
          <p className="text-xs text-ink/65">
            Distribution of the optimal circular action calculated across all registered inventory.
          </p>

          <div className="space-y-2.5 pt-2">
            {Object.keys(pathways).length === 0 ? (
              <p className="text-xs text-ink/40 py-4 text-center">No pathway data yet. Add products to see rankings.</p>
            ) : (
              Object.entries(pathways).map(([action, count]) => {
                const pct = summary?.total_products ? Math.round((count / summary.total_products) * 100) : 0
                return (
                  <div key={action} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-ink">
                      <span className="capitalize">{action}</span>
                      <span className="text-forest">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-forest/10 rounded-full h-2 overflow-hidden">
                      <div className="bg-forest h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Condition Quality Profile */}
        <div className="bg-white p-6 rounded-2xl border border-forest/10 shadow-sm space-y-4">
          <h3 className="font-bold text-forest-dark text-base flex items-center gap-2">
            <span>🔍</span>
            <span>Asset Health & Wear Buckets</span>
          </h3>
          <p className="text-xs text-ink/65">
            Wear-and-tear classification powered by OpenCV edge-density and user questionnaires.
          </p>

          <div className="space-y-3 pt-2">
            {Object.entries(conditions).map(([tier, count]) => {
              const pct = summary?.total_products ? Math.round((count / summary.total_products) * 100) : 0
              return (
                <div key={tier} className="p-3 bg-sage/30 rounded-xl border border-forest/10 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-forest-dark block">{tier}</span>
                    <span className="text-[11px] text-ink/50">{pct}% of total items</span>
                  </div>
                  <span className="text-lg font-bold text-forest">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* SDG 12 Academic Project Alignment Callout */}
      <div className="bg-forest/5 border border-forest/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest bg-forest/10 px-2.5 py-1 rounded-full border border-forest/20">
            UN Sustainable Development Goal 12
          </span>
          <h4 className="text-base font-bold text-forest-dark mt-2">
            Responsible Consumption & Production Compliance
          </h4>
          <p className="text-xs text-ink/70 mt-1 max-w-2xl leading-relaxed">
            By ranking Reuse, Repair, and Refurbishment above premature recycling and disposal, this system operationalizes the <strong>Waste Hierarchy (EU Waste Framework Directive 2008/98/EC)</strong> and directly targets <strong>SDG Indicator 12.5.1</strong>: National recycling rate and tons of material recycled or diverted.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-forest">{summary?.completed_actions_count || 0}</div>
          <div className="text-[11px] font-semibold text-ink/55">Tracked Completions</div>
        </div>
      </div>
    </div>
  )
}

