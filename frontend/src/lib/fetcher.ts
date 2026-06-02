import axios, { type AxiosResponse } from 'axios'
import { API_BASE_URL } from '../constants/api'

// Create Axios instance
const fetcher = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request middleware
fetcher.interceptors.request.use(
  (config) => {
    // Example: Add auth token if available
    const token = localStorage.getItem('token')

    if (token) {
      // config.headers = {
      // 	...(config.headers ?? {}),
      // 	Authorization: `Bearer ${token}`,
      // };
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Response middleware
fetcher.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Example: Handle global errors
    if (error.response && error.response.status === 401) {
      // Handle unauthorized
      // e.g., redirect to login
    }
    return Promise.reject(error)
  },
)

export default fetcher
