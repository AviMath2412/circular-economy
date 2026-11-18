import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const link = ({ isActive }) =>
    `px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-150 flex items-center gap-1.5 ${
      isActive ? 'bg-forest text-white shadow-xs' : 'text-forest hover:bg-forest/10'
    }`

  return (
    <nav className="bg-white/95 backdrop-blur border-b border-forest/10 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-16">
        {/* Brand */}
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-forest flex items-center justify-center text-white font-bold text-base shadow-xs">
            ♻
          </div>
          <div>
            <span className="font-bold text-forest-dark tracking-tight text-sm sm:text-base block leading-none">
              Circular Economy
            </span>
            <span className="text-[10px] text-ink/50 font-medium block mt-0.5 tracking-wider uppercase">
              Recommendation Engine
            </span>
          </div>
        </NavLink>

        {/* Links */}
        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/dashboard" className={link}>
            <span>📊</span>
            <span className="hidden sm:inline">Dashboard</span>
          </NavLink>
          <NavLink to="/products" className={link}>
            <span>📦</span>
            <span className="hidden sm:inline">Products</span>
          </NavLink>
          <NavLink to="/alternatives" className={link}>
            <span>🌱</span>
            <span className="hidden md:inline">Alternatives</span>
          </NavLink>
          <NavLink to="/reports" className={link}>
            <span>📑</span>
            <span className="hidden md:inline">Reports</span>
          </NavLink>

          {user?.role === 'admin' && (
            <NavLink to="/admin" className={link}>
              <span>🛡️</span>
              <span className="hidden lg:inline">Admin</span>
            </NavLink>
          )}

          {/* Notification Bell */}
          <NotificationBell />

          <div className="h-4 w-px bg-forest/20 mx-1 hidden sm:block" />

          {/* User badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-sage/50 border border-forest/10">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-xs font-semibold text-forest-dark">{user?.username}</span>
            {user?.role === 'admin' && (
              <span className="text-[9px] font-bold bg-amber/20 text-amber-dark px-1.5 py-0.2 rounded uppercase">
                Admin
              </span>
            )}
          </div>

          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-medium text-amber-dark bg-amber/10 hover:bg-amber/20 border border-amber/20 rounded-lg transition-colors cursor-pointer"
            title="Log out"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  )
}
