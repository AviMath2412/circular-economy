import { useEffect, useState } from 'react'
import * as productService from '../../services/productService'
import ProductCard from './ProductCard'
import LoadingSpinner from '../common/LoadingSpinner'

export default function ProductList({ refreshKey }) {
  const [products, setProducts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    productService
      .getProducts()
      .then(setProducts)
      .catch((err) => {
        console.error(err)
        setError('Failed to load products.')
      })
  }, [refreshKey])

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
        {error}
      </div>
    )
  }

  if (!products) return <LoadingSpinner label="Loading product portfolio" />

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-forest/10 p-6">
        <p className="text-ink/60 text-sm">No products added yet.</p>
        <p className="text-xs text-ink/40 mt-1">Add your first item above to generate circular economy action scores.</p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
