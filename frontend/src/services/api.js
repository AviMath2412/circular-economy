import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export function getErrorMessage(err, fallback = 'An unexpected error occurred') {
  if (!err) return fallback
  const detail = err.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item
        if (item?.msg) {
          const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : ''
          return field && field !== 'body' ? `${field}: ${item.msg}` : item.msg
        }
        return JSON.stringify(item)
      })
      .join(', ')
  }
  if (detail && typeof detail === 'object') {
    return detail.message || JSON.stringify(detail)
  }
  return err.response?.data?.message || err.message || fallback
}

export default api
