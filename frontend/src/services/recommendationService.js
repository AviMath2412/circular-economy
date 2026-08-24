import api from './api'

export const getRecommendations = (productId) =>
  api.get(`/recommendations/${productId}`).then((r) => r.data)

export const generateRecommendations = (productId) =>
  api.post(`/recommendations/generate/${productId}`).then((r) => r.data)
