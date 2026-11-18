import { useEffect, useState } from 'react'
import * as productService from '../../services/productService'
import { getErrorMessage } from '../../services/api'

export default function EditProductModal({ product, onClose, onSaved }) {
  const [categories, setCategories] = useState([])
  const [materials,  setMaterials]  = useState([])
  const [form, setForm] = useState({
    name:                 product.name,
    category_id:          product.category_id,
    material_id:          product.material_id ?? '',
    age_years:            product.age_years,
    condition_score:      product.condition_score,
    condition_description: product.condition_description ?? '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(console.error)
    productService.getMaterials().then(setMaterials).catch(console.error)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await productService.updateProduct(product.id, {
        name:                 form.name,
        category_id:          Number(form.category_id),
        material_id:          form.material_id ? Number(form.material_id) : null,
        age_years:            Number(form.age_years),
        condition_score:      Number(form.condition_score),
        condition_description: form.condition_description || null,
      })
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save changes'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-forest/15 z-50 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-forest/10">
          <h2 className="font-bold text-forest-dark text-base">Edit Product</h2>
          <button
            onClick={onClose}
            className="text-ink/40 hover:text-ink text-xl transition cursor-pointer leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-ink">Product Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-forest/20 rounded-lg px-3.5 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest"
            />
          </div>

          {/* Category + Material */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-ink">Category</label>
              <select
                required
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full border border-forest/20 rounded-lg px-3.5 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest/50 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-ink">Material</label>
              <select
                value={form.material_id}
                onChange={(e) => setForm({ ...form, material_id: e.target.value })}
                className="w-full border border-forest/20 rounded-lg px-3.5 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest/50 bg-white"
              >
                <option value="">Unknown / Mixed</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Age + Condition Score */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-ink">Age (Years)</label>
              <input
                type="number"
                min={0}
                required
                value={form.age_years}
                onChange={(e) => setForm({ ...form, age_years: e.target.value })}
                className="w-full border border-forest/20 rounded-lg px-3.5 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-ink">Condition Score (1–10)</label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={form.condition_score}
                onChange={(e) => setForm({ ...form, condition_score: e.target.value })}
                className="w-full border border-forest/20 rounded-lg px-3.5 py-2 text-ink font-semibold text-forest focus:outline-none focus:ring-2 focus:ring-forest/50"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-ink">Condition Notes</label>
            <textarea
              rows={2}
              value={form.condition_description}
              onChange={(e) => setForm({ ...form, condition_description: e.target.value })}
              className="w-full border border-forest/20 rounded-lg px-3.5 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest/50 resize-none"
            />
          </div>

          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-forest text-white rounded-lg py-2.5 font-medium hover:bg-forest-dark disabled:opacity-50 transition shadow-sm cursor-pointer"
            >
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-ink/60 hover:text-ink border border-forest/15 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

