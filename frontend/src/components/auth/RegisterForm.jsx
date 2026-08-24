import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function RegisterForm() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-4 bg-forest/10 border border-forest/20 text-forest text-sm rounded-lg text-center font-medium">
        ✓ Account created! Redirecting to login…
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Username</label>
        <input
          name="username"
          minLength={3}
          value={form.username}
          onChange={handleChange}
          required
          placeholder="e.g. johndoe"
          className="w-full bg-white border border-forest/20 rounded-lg px-3.5 py-2 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest transition"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="e.g. john@example.com"
          className="w-full bg-white border border-forest/20 rounded-lg px-3.5 py-2 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest transition"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
        <input
          name="password"
          type="password"
          minLength={6}
          value={form.password}
          onChange={handleChange}
          required
          placeholder="Min. 6 characters"
          className="w-full bg-white border border-forest/20 rounded-lg px-3.5 py-2 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest transition"
        />
      </div>
      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
          {error}
        </div>
      )}
      <button
        disabled={loading}
        type="submit"
        className="w-full bg-forest text-white rounded-lg py-2.5 font-medium hover:bg-forest-dark disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
      >
        {loading ? 'Creating account…' : 'Create account'}
      </button>
      <p className="text-sm text-center text-ink/60 pt-2">
        Already have an account? <Link to="/login" className="text-forest hover:text-forest-dark font-medium underline underline-offset-2">Sign in</Link>
      </p>
    </form>
  )
}
