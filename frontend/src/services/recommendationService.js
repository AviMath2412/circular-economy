import api from './api'

export const getRecommendations = (productId) =>
  api.get(`/recommendations/${productId}`).then((r) => r.data)

export const generateRecommendations = (productId) =>
  api.post(`/recommendations/generate/${productId}`).then((r) => r.data)

export const completeAction = (actionId, notes = '') =>
  api.post(`/recommendations/${actionId}/complete`, { notes }).then((r) => r.data)

export const getActionHistory = () =>
  api.get('/actions/history').then((r) => r.data)

export const deleteActionLog = (logId) =>
  api.delete(`/actions/${logId}`).then((r) => r.data)
