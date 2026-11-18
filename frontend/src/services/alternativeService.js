import api from './api'

export const getAlternatives = (params = {}) =>
  api.get('/alternatives', { params }).then((r) => r.data)

export const getProductAlternatives = (productId) =>
  api.get(`/alternatives/product/${productId}`).then((r) => r.data)

