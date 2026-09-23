import { api } from "@/lib/axios"
import type { ApiResponse } from "@/types/auth"
import type {
  ChangePasswordRequest,
  Profile,
  UpdateProfileRequest,
} from "@/types/profile"

export const profileService = {
  get: async (): Promise<Profile> => {
    const response = await api.get<ApiResponse<Profile>>("/profile")
    return response.data.data
  },

  update: async (payload: UpdateProfileRequest): Promise<Profile> => {
    const response = await api.patch<ApiResponse<Profile>>("/profile", payload)
    return response.data.data
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<void> => {
    await api.put("/profile/password", payload)
  },
}


