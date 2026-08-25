import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const getScoreBadgeColor = (score) => {
    if (score >= 8) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (score >= 5) return 'bg-amber-100 text-amber-900 border-amber-200'
    return 'bg-rose-100 text-rose-800 border-rose-200'
  }

  const imageUrl = product.image_path
    ? (product.image_path.startsWith('http') ? product.image_path : `http://localhost:8000${product.image_path}`)
    : null

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block bg-white border border-forest/15 rounded-xl overflow-hidden hover:border-forest/50 hover:shadow-md transition-all duration-200"
    >
      {imageUrl && (
        <div className="h-36 w-full bg-ink/5 overflow-hidden border-b border-forest/10">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-forest-dark group-hover:text-forest transition line-clamp-1">
            {product.name}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ml-2 ${getScoreBadgeColor(product.condition_score)}`}>
            {product.condition_score}/10
          </span>
        </div>
        <p className="text-sm text-ink/60 mb-3">
          {product.category_name} · {product.material_name || 'Mixed/Unknown Material'}
        </p>
        <div className="flex items-center justify-between text-xs text-ink/50 pt-2 border-t border-forest/5">
          <span>{product.age_years} {product.age_years === 1 ? 'year' : 'years'} old</span>
          <span className="text-forest font-medium group-hover:underline">View circular actions →</span>
        </div>
      </div>
    </Link>
  )
}

