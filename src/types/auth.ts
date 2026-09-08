// src/types/auth.ts

export interface LoginRequest {
  email: string;      // Sesuai tag json:"email" di Go
  password: string;   // Sesuai tag json:"password" di Go
}

export interface RefreshTokenRequest {
  refresh_token: string; 
}

export interface LoginResponse {
  access_token: string;         
  refresh_token?: string;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}