import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as productService from '../../services/productService'
import ImageUpload from './ImageUpload'

const emptyAssessment = {
  functionality_score: 7,
  physical_damage_score: 7,
  cosmetic_score: 7,
  has_original_parts: true,
}

export default function ProductForm({ onSuccess }) {
  const [categories, setCategories] = useState([])
  const [materials, setMaterials] = useState([])
  const [assessment, setAssessment] = useState(emptyAssessment)
  const [assessmentResult, setAssessmentResult] = useState(null)
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    material_id: '',
    age_years: 0,
    condition_score: 7,
    condition_description: '',
    image_path: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(console.error)
    productService.getMaterials().then(setMaterials).catch(console.error)
  }, [])

  const handleImageAnalysisComplete = (analysis) => {
    if (!analysis) {
      setForm((f) => ({ ...f, image_path: '' }))
      return
    }

    const score = analysis.estimated_score
    setForm((f) => ({
      ...f,
      condition_score: score,
      image_path: analysis.image_path || f.image_path,
      condition_description: f.condition_description
        ? f.condition_description
        : `Auto-assessed via image: ${analysis.confidence_notes}`,
    }))

    // Update questionnaire sliders to match detected score
    setAssessment({
      functionality_score: Math.min(10, Math.max(1, score)),
      physical_damage_score: Math.min(10, Math.max(1, score)),
      cosmetic_score: Math.min(10, Math.max(1, score)),
      has_original_parts: score >= 6,
    })
  }

  const runAssessment = async () => {
    try {
      const result = await productService.assessCondition(assessment)
      setAssessmentResult(result)
      setForm((f) => ({ ...f, condition_score: result.condition_score }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        name: form.name,
        category_id: Number(form.category_id),
        material_id: form.material_id ? Number(form.material_id) : null,
        age_years: Number(form.age_years),
        condition_score: Number(form.condition_score),
        condition_description: form.condition_description || null,
        image_path: form.image_path || null,
      }
      const res = await productService.createProduct(payload)
      if (onSuccess) {
        onSuccess(res.product_id)
      } else {
        navigate(`/products/${res.product_id}`)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save product')
    } finally {
      setSubmitting(false)
    }
  }

  const sliderRow = (label, key, helper) => (
    <div>
      <div className="flex justify-between items-center text-sm mb-1.5">
        <div>
          <span className="font-medium text-ink">{label}</span>
          {helper && <span className="text-xs text-ink/50 block">{helper}</span>}
        </div>
        <span className="text-forest font-semibold px-2 py-0.5 bg-forest/10 rounded text-xs">
          {assessment[key]} / 10
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={assessment[key]}
        onChange={(e) => setAssessment({ ...assessment, [key]: Number(e.target.value) })}
        className="w-full h-1.5 bg-forest/20 rounded-lg appearance-none cursor-pointer accent-forest"
      />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Product Photo Upload & Condition Auto-Detection */}
      <ImageUpload
        onAnalysisComplete={handleImageAnalysisComplete}
        initialScore={form.condition_score}
      />

      {/* Assessment Section */}
      <section className="bg-white border border-forest/15 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-forest font-bold">🔍</span>
          <h2 className="font-semibold text-forest-dark">Condition Assessment Questionnaire</h2>
        </div>
        <p className="text-xs text-ink/60 mb-4">
          Adjust the sliders to evaluate product condition and automatically calculate a weighted condition score.
        </p>
        <div className="space-y-4 bg-sage/40 rounded-lg p-4 border border-forest/10">
          {sliderRow('Functionality', 'functionality_score', 'Does it still work as intended?')}
          {sliderRow('Structural Integrity', 'physical_damage_score', 'Cracks, dents, functional wear')}
          {sliderRow('Cosmetics', 'cosmetic_score', 'Scratches, discoloration, visual appearance')}
          <label className="flex items-center gap-2.5 text-sm text-ink cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={assessment.has_original_parts}
              onChange={(e) => setAssessment({ ...assessment, has_original_parts: e.target.checked })}
              className="rounded text-forest focus:ring-forest accent-forest w-4 h-4"
            />
            <span>All original components and parts present</span>
          </label>
          <div className="pt-2">
            <button
              type="button"
              onClick={runAssessment}
              className="text-sm bg-amber/15 text-amber-dark font-semibold px-4 py-2 rounded-lg border border-amber/30 hover:bg-amber/25 transition shadow-sm cursor-pointer"
            >
              ⚡ Calculate Condition Score
            </button>
          </div>
          {assessmentResult && (
            <div className="text-sm text-forest bg-forest/10 border border-forest/20 rounded-lg p-3.5 mt-2 animate-fadeIn">
              <div className="font-semibold">
                Resulting Score: <span className="text-base">{assessmentResult.condition_score}</span> / 10
              </div>
              <p className="text-xs text-ink/75 mt-1">{assessmentResult.summary}</p>
            </div>
          )}
        </div>
      </section>

      {/* Product Details Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-forest/15 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-forest-dark text-base">Product Details</h2>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink">Product Name</label>
          <input
            required
            placeholder="e.g. Dell XPS 15 or Office Chair"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-forest/20 rounded-lg px-3.5 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-ink">Category</label>
            <select
              required
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full border border-forest/20 rounded-lg px-3.5 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest bg-white"
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.typical_lifespan_years} yr lifespan)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-ink">Primary Material</label>
            <select
              value={form.material_id}
              onChange={(e) => setForm({ ...form, material_id: e.target.value })}
              className="w-full border border-forest/20 rounded-lg px-3.5 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest bg-white"
            >
              <option value="">Unknown / Mixed Materials</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (Recycle: {m.recyclability_score}/10, Repair: {m.repairability_score}/10)
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-ink">Current Age (Years)</label>
            <input
              type="number"
              min={0}
              required
              value={form.age_years}
              onChange={(e) => setForm({ ...form, age_years: e.target.value })}
              className="w-full border border-forest/20 rounded-lg px-3.5 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest"
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
              className="w-full border border-forest/20 rounded-lg px-3.5 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest font-semibold text-forest"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-ink">Condition Notes / Description</label>
          <textarea
            value={form.condition_description}
            placeholder="Add any specific details regarding wear, missing screws, or battery health..."
            onChange={(e) => setForm({ ...form, condition_description: e.target.value })}
            className="w-full border border-forest/20 rounded-lg px-3.5 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest"
            rows={2}
          />
        </div>
        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
            {error}
          </div>
        )}
        <button
          disabled={submitting}
          type="submit"
          className="bg-forest text-white rounded-lg px-5 py-2.5 font-medium hover:bg-forest-dark disabled:opacity-50 transition shadow-sm cursor-pointer"
        >
          {submitting ? 'Adding Product…' : 'Save Product & View Recommendations'}
        </button>
      </form>
    </div>
  )
}
