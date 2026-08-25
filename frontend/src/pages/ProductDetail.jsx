import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as productService from '../services/productService'
import RecommendationList from '../components/recommendations/RecommendationList'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    productService
      .getProduct(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove "${product?.name}"?`)) return
    try {
      setDeleting(true)
      await productService.deleteProduct(id)
      navigate('/products')
    } catch (err) {
      console.error(err)
      alert('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading product data" />

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-ink/60">Product not found.</p>
        <Link to="/products" className="text-forest font-medium mt-2 inline-block hover:underline">
          ← Back to products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link to="/products" className="text-xs font-semibold text-forest flex items-center gap-1 hover:underline">
        ← Back to All Products
      </Link>

      <div className="bg-white border border-forest/15 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-5 flex-1">
            {product.image_path && (
              <div className="w-full sm:w-36 h-36 rounded-xl overflow-hidden bg-ink/5 border border-forest/20 shrink-0">
                <img
                  src={
                    product.image_path.startsWith('http')
                      ? product.image_path
                      : `http://localhost:8000${product.image_path}`
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-forest-dark">{product.name}</h1>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-forest/10 text-forest border border-forest/20">
                  Condition: {product.condition_score}/10
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/65 mt-2">
                <span>Category: <strong>{product.category_name}</strong></span>
                <span>•</span>
                <span>Material: <strong>{product.material_name || 'Mixed/Unknown'}</strong></span>
                <span>•</span>
                <span>Age: <strong>{product.age_years} {product.age_years === 1 ? 'yr' : 'yrs'}</strong></span>
              </div>
              {product.condition_description && (
                <p className="text-xs bg-sage/50 border border-forest/10 rounded-lg p-3 text-ink/75 mt-3">
                  <span className="font-semibold text-forest-dark">Notes: </span>
                  {product.condition_description}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer shrink-0"
          >
            {deleting ? 'Deleting…' : 'Delete Product'}
          </button>
        </div>
      </div>

      {/* Recommendations */}
      <RecommendationList productId={product.id} />
    </div>
  )
}
