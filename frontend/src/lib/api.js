import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pharmax_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || ''
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register')
    if (err.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem('pharmax_token')
      localStorage.removeItem('pharmax_user')
      window.location.href = '/signin'
    }
    return Promise.reject(err)
  }
)

export default api
