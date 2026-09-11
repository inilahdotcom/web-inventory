import { api } from "@/lib/axios"
import { authStorage } from "@/lib/auth-storage"
import type { ApiResponse, LoginRequest, LoginResponse } from "@/types/auth"

export const authService = {
  login: async (
    payload: LoginRequest,
    rememberMe: boolean
  ): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      "/users/login",
      payload
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
