import { useState } from 'react'
import ProductForm from '../components/products/ProductForm'
import ProductList from '../components/products/ProductList'

export default function Products() {
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleProductAdded = () => {
    setShowForm(false)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-forest/10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-forest-dark">Product Portfolio</h1>
          <p className="text-sm text-ink/60 mt-0.5">
            Manage your registered items and track circular economy options
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-forest text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-forest-dark transition shadow-sm cursor-pointer flex items-center gap-1.5"
        >
          <span>{showForm ? '✕' : '+'}</span>
          <span>{showForm ? 'Close Form' : 'Add New Product'}</span>
        </button>
      </div>

      {showForm && (
        <div className="animate-fadeIn">
          <ProductForm onSuccess={handleProductAdded} />
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-ink/70 uppercase tracking-wider px-1">
          Registered Products
        </h2>
        <ProductList refreshKey={refreshKey} />
      </div>
    </div>
  )
}
