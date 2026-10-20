export type UserRole = "admin" | "staff_ga" | "viewer"
export type UserStatus = "active" | "inactive"

export interface ManagedUser {
  id: number
  attributes: {
    name: string
    email: string
    phone: string | null
    role: UserRole
    status: UserStatus
    lastLoginAt: string | null
    createdAt: string | null
    updatedAt: string | null
  }
}

export interface UserListParams {
  search?: string
  cursor?: string
  pageSize?: number
  sort?: "name:asc" | "name:desc" | "createdAt:asc" | "createdAt:desc"
}

export interface UserListResult {
  users: ManagedUser[]
  pagination: {
    pageSize: number
    hasNextPage: boolean
    nextCursor: string
  }
}

export interface CreateUserPayload {
  name: string
  email: string
  phone: string
  password: string
  role: UserRole
  status: UserStatus
}

export type UpdateUserPayload = Partial<CreateUserPayload>
