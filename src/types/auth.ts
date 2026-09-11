export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
