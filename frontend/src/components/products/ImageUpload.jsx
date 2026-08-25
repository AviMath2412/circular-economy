import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import * as productService from '../../services/productService'

export default function ImageUpload({ onAnalysisComplete, initialScore = 7 }) {
  const [preview, setPreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [adjustedScore, setAdjustedScore] = useState(initialScore)
  const [error, setError] = useState('')

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (!file) return

      setError('')
      setAnalyzing(true)
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      try {
        const result = await productService.analyzeImage(file)
        setAnalysisResult(result)
        setAdjustedScore(result.estimated_score)
        if (onAnalysisComplete) {
          onAnalysisComplete(result)
        }
      } catch (err) {
        console.error('Image analysis failed:', err)
        setError(err.response?.data?.detail || 'Failed to analyze product image. You can still enter condition manually.')
      } finally {
        setAnalyzing(false)
      }
    },
    [onAnalysisComplete]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    multiple: false,
  })

  const handleScoreChange = (newScore) => {
    setAdjustedScore(newScore)
    if (onAnalysisComplete && analysisResult) {
      onAnalysisComplete({
        ...analysisResult,
        estimated_score: newScore,
      })
    }
  }

  const handleClear = () => {
    setPreview(null)
    setAnalysisResult(null)
    setError('')
    if (onAnalysisComplete) {
      onAnalysisComplete(null)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'bg-emerald-100 text-emerald-800 border-emerald-300'
    if (score >= 5) return 'bg-amber-100 text-amber-900 border-amber-300'
    return 'bg-rose-100 text-rose-800 border-rose-300'
  }

  return (
    <div className="bg-white border border-forest/15 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-forest font-bold text-lg">📷</span>
          <h2 className="font-semibold text-forest-dark text-base">Product Image & Condition Auto-Detection</h2>
        </div>
        {preview && !analyzing && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
          >
            Remove / Retake Photo
          </button>
        )}
      </div>
      <p className="text-xs text-ink/60">
        Upload a photo of the product to automatically analyze surface wear, scratches, and condition using OpenCV heuristics. You can freely adjust the detected score.
      </p>

      {!preview ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-forest bg-forest/5 scale-[1.01]'
              : 'border-forest/25 bg-sage/20 hover:border-forest hover:bg-forest/5'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center text-forest text-2xl">
              📸
            </div>
            <div>
              <p className="text-sm font-medium text-forest-dark">
                {isDragActive ? 'Drop the product photo here…' : 'Drag & drop a product photo, or click to browse'}
              </p>
              <p className="text-xs text-ink/50 mt-1">Supports PNG, JPG, JPEG, WEBP (Max 10MB)</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start bg-sage/30 p-4 rounded-xl border border-forest/10">
            <div className="relative w-full sm:w-40 h-40 bg-ink/5 rounded-lg overflow-hidden border border-forest/20 shrink-0">
              <img
                src={preview}
                alt="Product preview"
                className="w-full h-full object-cover"
              />
              {analyzing && (
                <div className="absolute inset-0 bg-forest-dark/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs p-2 text-center animate-fadeIn">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mb-2" />
                  <span>Scanning image heuristics…</span>
                </div>
              )}
            </div>

            <div className="flex-1 w-full space-y-3">
              {analyzing ? (
                <div className="space-y-2 py-4">
                  <div className="h-4 bg-forest/20 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-forest/15 rounded animate-pulse w-full" />
                  <div className="h-3 bg-forest/15 rounded animate-pulse w-2/3" />
                  <p className="text-xs text-forest font-medium pt-2">
                    Running OpenCV blur, lighting, and edge density filters…
                  </p>
                </div>
              ) : analysisResult ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink/75 uppercase tracking-wide">
                        Auto-Detected Score:
                      </span>
                      <span
                        className={`text-sm font-bold px-2.5 py-0.5 rounded-full border ${getScoreColor(
                          adjustedScore
                        )}`}
                      >
                        {adjustedScore} / 10
                      </span>
                    </div>
                    <span className="text-xs text-forest font-medium bg-forest/10 px-2 py-0.5 rounded">
                      ✨ OpenCV Heuristic Analysis
                    </span>
                  </div>

                  <p className="text-xs text-ink/75 bg-white p-2.5 rounded-lg border border-forest/10">
                    <strong className="text-forest-dark">Heuristic Notes: </strong>
                    {analysisResult.confidence_notes}
                  </p>

                  {/* Interactive condition score slider */}
                  <div className="pt-1">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-medium text-ink">Fine-tune Condition Score:</span>
                      <span className="font-bold text-forest">{adjustedScore} / 10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={adjustedScore}
                      onChange={(e) => handleScoreChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-forest/20 rounded-lg appearance-none cursor-pointer accent-forest"
                    />
                    <div className="flex justify-between text-[10px] text-ink/40 mt-0.5">
                      <span>1 (Poor / Scrap)</span>
                      <span>5 (Fair / Repaired)</span>
                      <span>10 (Like New)</span>
                    </div>
                  </div>

                  {analysisResult.breakdown && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div className="bg-white/80 border border-forest/10 p-1.5 rounded text-center">
                        <span className="text-[10px] text-ink/50 block">Sharpness</span>
                        <span className="text-xs font-semibold text-ink">
                          {analysisResult.breakdown.sharpness}
                        </span>
                      </div>
                      <div className="bg-white/80 border border-forest/10 p-1.5 rounded text-center">
                        <span className="text-[10px] text-ink/50 block">Edge Texture</span>
                        <span className="text-xs font-semibold text-ink">
                          {(analysisResult.breakdown.edge_density * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-white/80 border border-forest/10 p-1.5 rounded text-center">
                        <span className="text-[10px] text-ink/50 block">Brightness</span>
                        <span className="text-xs font-semibold text-ink">
                          {Math.round(analysisResult.breakdown.brightness)}/255
                        </span>
                      </div>
                      <div className="bg-white/80 border border-forest/10 p-1.5 rounded text-center">
                        <span className="text-[10px] text-ink/50 block">Contrast</span>
                        <span className="text-xs font-semibold text-ink">
                          {Math.round(analysisResult.breakdown.contrast)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}
