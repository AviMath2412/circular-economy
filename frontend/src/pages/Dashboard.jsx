import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as productService from '../services/productService'
import * as recommendationService from '../services/recommendationService'
import SummaryCards from '../components/dashboard/SummaryCards'
import ImpactChart from '../components/dashboard/ImpactChart'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function Dashboard() {
  const [products, setProducts] = useState(null)
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productService
      .getProducts()
      .then(async (prods) => {
        setProducts(prods)
        const recs = await Promise.all(
          prods.map((p) =>
            recommendationService.getRecommendations(p.id).catch(() => null)
          )
        )
        const chartItems = recs
          .filter(Boolean)
          .map((r) => {
            const topAction = r.actions.find((a) => a.is_recommended) || r.actions[0]
            return {
              name: r.product_name,
              action: topAction?.action_type || '',
              co2: topAction?.environmental_impact?.estimated_co2_savings_kg || 0,
              landfill: topAction?.environmental_impact?.estimated_landfill_diverted_kg || 0,
            }
          })
        setChartData(chartItems)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Compiling dashboard analytics" />

  const productCount = products ? products.length : 0
  const avgCondition = productCount
    ? Math.round((products.reduce((s, p) => s + p.condition_score, 0) / productCount) * 10) / 10
    : null
  const totalCo2 = Math.round(chartData.reduce((s, d) => s + d.co2, 0))
  const totalLandfill = Math.round(chartData.reduce((s, d) => s + d.landfill, 0))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-forest/10 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-forest-dark">Circularity Dashboard</h1>
          <p className="text-sm text-ink/65 mt-1">
            Real-time analytics and carbon avoidance across your tracked assets
          </p>
        </div>
        <Link
          to="/products"
          className="bg-forest text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-forest-dark transition shadow-sm flex items-center gap-2"
        >
          <span>📦</span>
          <span>Manage Products</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <SummaryCards
        productCount={productCount}
        avgCondition={avgCondition}
        totalCo2={totalCo2}
        totalLandfill={totalLandfill}
      />

      {/* Chart */}
      <ImpactChart data={chartData} />
    </div>
  )
}
