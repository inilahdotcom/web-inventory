import axios, { type AxiosRequestConfig } from "axios"
import { authStorage } from "@/lib/auth-storage"
import type { ApiResponse, LoginResponse } from "@/types/auth"

type RetryableRequest = AxiosRequestConfig & { _retry?: boolean }

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8082/api"
const apiKey = import.meta.env.VITE_API_KEY || "YOUR_API_KEY_HERE"

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
})

// 1. SISIPKAN API KEY & BEARER TOKEN DI SETIAP REQUEST
api.interceptors.request.use((config) => {
  if (apiKey) {
    config.headers["x-api-key"] = apiKey
  }

  const token = authStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// 2. TANGANI AUTO-REFRESH TOKEN SAAT ACCESS TOKEN KEDALUWARSA
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequest | undefined

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/users/login") &&
      !originalRequest.url?.includes("/users/refresh-token")
    ) {
      originalRequest._retry = true

      try {
        const refreshToken = authStorage.getRefreshToken()
        if (!refreshToken) {
          throw new Error("Refresh token tidak ditemukan")
        }

        // Pastikan request refresh-token juga menyisipkan API Key
        const res = await axios.post<ApiResponse<LoginResponse>>(
          `${apiBaseUrl}/users/refresh-token`,
          { refresh_token: refreshToken },
          {
            headers: {
              "x-api-key": apiKey,
            },
          }
        )

        const tokens = res.data.data
        if (!tokens?.access_token || !tokens.refresh_token) {
          throw new Error("Token tidak ditemukan pada respons refresh")
        }

        authStorage.update(tokens)

        originalRequest.headers = {
          ...originalRequest.headers,
          "x-api-key": apiKey,
          Authorization: `Bearer ${tokens.access_token}`,
        }

        return api(originalRequest)
      } catch (refreshError) {
        authStorage.clear()
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)