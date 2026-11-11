import { api } from "@/lib/axios"
import { authStorage } from "@/lib/auth-storage"
import type { ApiResponse, LoginRequest, LoginResponse } from "@/types/auth"

export interface PublicDashboardStats {
  summary: {
    total_asset_types: number
    total_quantity: number
    total_asset_value: number
    total_damaged: number
  }
}

export const authService = {
  login: async (
    payload: LoginRequest,
    rememberMe: boolean
  ): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      "/users/login",
      payload,
      {
        headers: {
          "x-api-key": import.meta.env.VITE_API_KEY || "API_KEY",
        },
      }
    )
    const data = response.data.data

    if (!data?.access_token || !data.refresh_token) {
      throw new Error("Token tidak ditemukan pada respons server")
    }
    authStorage.save(data, rememberMe)
    return data
  },

  getPublicStats: async (): Promise<PublicDashboardStats | null> => {
    try {
      const response = await api.get<{ data: PublicDashboardStats }>(
        "/public/stats"
      )
      return response.data?.data || response.data
    } catch {
      return null
    }
  },

  forgotPassword: async (email: string) => {
    const response = await api.post(
      "/users/forgot-password",
      { email },
      {
        headers: {
          "x-api-key": import.meta.env.VITE_API_KEY || "API_KEY",
        },
      }
    )
    return response.data
  },

  resetPassword: async (payload: { token: string; new_password: string }) => {
    const response = await api.post(
      "/users/reset-password",
      {
        token: payload.token,
        password: payload.new_password,
        new_password: payload.new_password,
      },
      {
        headers: {
          "x-api-key": import.meta.env.VITE_API_KEY || "API_KEY",
        },
      }
    )
    return response.data
  },

  logout: async () => {
    try {
      const token = authStorage.getAccessToken()

      await api.post(
        "/users/logout",
        {},
        {
          headers: {
            "x-api-key": import.meta.env.VITE_API_KEY || "API_KEY",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      )
    } catch (err) {
      console.error("Gagal mencatat logout di server:", err)
    } finally {
      authStorage.clear()
      window.location.href = "/auth/login"
    }
  },
}
