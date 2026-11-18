import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import * as notificationService from '../../services/notificationService'

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const popoverRef = useRef(null)

  const loadNotifications = () => {
    notificationService
      .getNotifications()
      .then(setNotifications)
      .catch(() => {})
  }

  useEffect(() => {
    loadNotifications()
    const timer = setInterval(loadNotifications, 45000)
    return () => clearInterval(timer)
  }, [])

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch {}
  }

  const handleMarkAllRead = async () => {
    try {
      setLoading(true)
      await notificationService.markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch {} finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-forest hover:bg-forest/10 transition-colors cursor-pointer"
        title="Circular Notifications & Reminders"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-forest/15 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-sage/40 border-b border-forest/10">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-forest-dark text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold bg-amber/20 text-amber-dark px-2 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-xs text-forest hover:text-forest-dark font-medium transition cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-forest/5">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-ink/50">
                <span className="text-2xl block mb-1">🌿</span>
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 transition-colors ${
                    n.is_read ? 'bg-white hover:bg-sage/20' : 'bg-forest/5 hover:bg-forest/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        {!n.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        )}
                        <h4 className="text-xs font-semibold text-forest-dark">{n.title}</h4>
                      </div>
                      <p className="text-[12px] text-ink/75 mt-1 leading-snug">{n.message}</p>
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => {
                            handleMarkRead(n.id)
                            setOpen(false)
                          }}
                          className="inline-block text-[11px] text-forest font-semibold mt-1.5 hover:underline"
                        >
                          View Action →
                        </Link>
                      )}
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-[11px] text-ink/40 hover:text-ink shrink-0 cursor-pointer"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

