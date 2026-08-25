import api from './api'

export const getCategories = () => api.get('/categories').then((r) => r.data)
export const getMaterials = () => api.get('/materials').then((r) => r.data)
export const getProducts = () => api.get('/products').then((r) => r.data)
export const getProduct = (id) => api.get(`/products/${id}`).then((r) => r.data)
export const createProduct = (payload) => api.post('/products', payload).then((r) => r.data)
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload).then((r) => r.data)
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data)
export const assessCondition = (payload) =>
  api.post('/products/assess-condition', payload).then((r) => r.data)

export const analyzeImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api
    .post('/products/analyze-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)
}

