import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

const SERVER_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL

if (!SERVER_BASE_URL) {
  throw new Error(
    'NEXT_PUBLIC_SERVER_BASE_URL is not defined in environment variables',
  )
}

const axiosInstance = axios.create({
  baseURL: SERVER_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession()
    if (session?.accessToken) {
      config.headers['Authorization'] = `Bearer ${session.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // For Google auth, we might not need to refresh the token manually
        // as NextAuth should handle this for us. However, you can add custom
        // logic here if needed.

        // If token refresh fails or is not implemented, sign out the user
        await signOut({ redirect: false })
        window.location.href = '/auth/signin'
      } catch (refreshError) {
        await signOut({ redirect: false })
        window.location.href = '/auth/signin'
      }

      return Promise.reject(error)
    }

    if (error.response?.status === 403) {
      console.error(
        'Access forbidden. You do not have permission to access this resource.',
      )
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
