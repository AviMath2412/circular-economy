import LoginForm from '../components/auth/LoginForm'

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sage px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-forest text-white text-2xl font-bold shadow-md mb-3">
            ♻
          </div>
          <h1 className="text-2xl font-bold text-forest-dark tracking-tight">Circular Economy Engine</h1>
          <p className="text-sm text-ink/60 mt-1">Smart circular actions & lifecycle intelligence</p>
        </div>

        <div className="bg-white shadow-md shadow-forest/5 rounded-2xl p-8 border border-forest/10">
          <h2 className="text-lg font-semibold text-forest-dark mb-5">Sign in to your account</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
