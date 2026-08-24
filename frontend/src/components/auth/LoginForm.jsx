import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="e.g. admin or username"
          className="w-full bg-white border border-forest/20 rounded-lg px-3.5 py-2 text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest transition"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
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
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="text-sm text-center text-ink/60 pt-2">
        Don't have an account? <Link to="/register" className="text-forest hover:text-forest-dark font-medium underline underline-offset-2">Register</Link>
      </p>
    </form>
  )
}
