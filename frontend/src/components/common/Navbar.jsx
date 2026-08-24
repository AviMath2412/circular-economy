import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const link = ({ isActive }) =>
    `px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
      isActive ? 'bg-forest text-white shadow-sm' : 'text-forest hover:bg-forest/10'
    }`

  return (
    <nav className="bg-white/95 backdrop-blur border-b border-forest/10 sticky top-0 z-20">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center text-white font-bold text-base shadow-sm">
            ♻
          </div>
          <span className="font-semibold text-forest-dark tracking-tight">Circular Economy</span>
        </div>
        <div className="flex items-center gap-2">
          <NavLink to="/dashboard" className={link}>Dashboard</NavLink>
          <NavLink to="/products" className={link}>Products</NavLink>
          <div className="h-4 w-px bg-forest/20 mx-1 hidden sm:block"></div>
          <span className="text-xs font-medium text-ink/60 hidden sm:inline px-1">{user?.username}</span>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="px-3 py-1.5 text-sm font-medium text-amber-dark bg-amber/10 hover:bg-amber/20 border border-amber/20 rounded-lg transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  )
}
