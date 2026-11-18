import api from './api'

export const login = (username, password) =>
  api.post('/auth/login', { username, password }).then((r) => r.data)

export const register = (username, email, password) =>
  api.post('/auth/register', { username, email, password }).then((r) => r.data)

export const me = () => api.get('/auth/me').then((r) => r.data)

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email }).then((r) => r.data)

export const resetPassword = (token, newPassword) =>
  api.post('/auth/reset-password', { token, new_password: newPassword }).then((r) => r.data)
