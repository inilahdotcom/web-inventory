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

  // 1. Fungsi Permintaan Lupa Password (Kirim Link/Token ke Email)
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

  // 2. Fungsi Eksekusi Reset Password
  resetPassword: async (payload: { token: string; new_password: string }) => {
    const response = await api.post(
      "/users/reset-password",
      {
        token: payload.token,
        password: payload.new_password,     // Dikirim jika DTO Go memakai struct tag `json:"password"`
        new_password: payload.new_password, // Dikirim jika DTO Go memakai struct tag `json:"new_password"`
      },
      {
        headers: {
          "x-api-key": import.meta.env.VITE_API_KEY || "API_KEY",
        },
      }
    )
    return response.data
  },

  logout: () => {
    authStorage.clear()
    window.location.href = "/auth/login"
  },
}