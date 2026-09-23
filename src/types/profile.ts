export interface ProfileData {
  name: string
  email: string
  phone: string | null
  role: string
  status: string
  createdAt: string | null
  updatedAt: string | null
}

export interface Profile {
  id: number
  attributes: ProfileData
}

export interface UpdateProfileRequest {
  name: string
  phone: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  new_password_confirmation: string
}


