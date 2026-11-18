import api from './api'

export const getReportSummary = () =>
  api.get('/reports/summary').then((r) => r.data)

export const downloadReportCsv = async (categoryId = null) => {
  const token = localStorage.getItem('token')
  const url = categoryId
    ? `http://localhost:8000/api/reports/export?category_id=${categoryId}`
    : 'http://localhost:8000/api/reports/export'

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error('Failed to download report')

  const blob = await response.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = `circular_economy_report_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(downloadUrl)
}

