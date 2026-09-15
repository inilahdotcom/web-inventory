import { api } from "@/lib/axios"
import { authStorage } from "@/lib/auth-storage"
import type { ApiResponse, LoginRequest, LoginResponse } from "@/types/auth"

export const authService = {
  login: async (
    payload: LoginRequest,
    rememberMe: boolean
  ): Promise<LoginResponse> => {
    // Tambahkan header X-API-KEY / x-api-key di opsi request
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

  logout: () => {
    authStorage.clear()
    window.location.href = "/login"
  },
}