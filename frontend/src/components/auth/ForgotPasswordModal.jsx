import { useState } from 'react'
import * as authService from '../../services/authService'
import { getErrorMessage } from '../../services/api'

export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1) // 1: request token, 2: set new password
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleRequestToken = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authService.forgotPassword(email)
      if (res.reset_token) {
        setToken(res.reset_token)
        setMessage('Reset token generated. Enter your new password below.')
        setStep(2)
      } else {
        setMessage(res.message)
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not request password reset'))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.resetPassword(token, newPassword)
      setMessage('Password successfully changed! You can now sign in with your new password.')
      setTimeout(() => onClose(), 2000)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update password'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-forest/15 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-forest/10 bg-sage/30">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔐</span>
            <h3 className="font-bold text-forest-dark text-base">Reset Account Password</h3>
          </div>
          <button
            onClick={onClose}
            className="text-ink/40 hover:text-ink text-xl transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {message && (
            <div className="p-3 bg-forest/10 border border-forest/20 text-forest text-xs font-semibold rounded-lg mb-4">
              ✓ {message}
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg mb-4">
              ✕ {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <p className="text-xs text-ink/70">
                Enter your registered email address. We will verify your account and provide a secure password reset token.
              </p>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Registered Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-forest/20 rounded-lg px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-forest text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-forest-dark transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {loading ? 'Verifying…' : 'Generate Reset Token'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Reset Token</label>
                <input
                  type="text"
                  required
                  readOnly
                  value={token}
                  className="w-full border border-forest/20 rounded-lg px-3.5 py-2 text-[11px] font-mono text-ink/60 bg-sage/40"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">New Password</label>
                <input
                  type="password"
                  minLength={6}
                  required
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-forest/20 rounded-lg px-3.5 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-forest text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-forest-dark transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {loading ? 'Updating…' : 'Set New Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

