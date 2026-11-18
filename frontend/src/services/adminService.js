import api from './api'

export const getUsers = () => api.get('/admin/users').then((r) => r.data.users)

export const updateUserRole = (userId, role) =>
  api.put(`/admin/users/${userId}/role?role=${role}`).then((r) => r.data)

export const createCategory = (payload) =>
  api.post('/admin/categories', payload).then((r) => r.data)

export const deleteCategory = (id) =>
  api.delete(`/admin/categories/${id}`).then((r) => r.data)

export const createMaterial = (payload) =>
  api.post('/admin/materials', payload).then((r) => r.data)

export const deleteMaterial = (id) =>
  api.delete(`/admin/materials/${id}`).then((r) => r.data)

