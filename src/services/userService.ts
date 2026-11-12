import { api } from "@/lib/axios"
import type {
  CreateUserPayload,
  ManagedUser,
  UpdateUserPayload,
  UserListParams,
  UserListResult,
} from "@/types/user"

type UserListResponse = {
  data: ManagedUser[]
  meta?: {
    pagination?: UserListResult["pagination"]
  }
}

type UserResponse = { data: ManagedUser }

export const userService = {
  list: async (
    params: UserListParams,
    signal?: AbortSignal
  ): Promise<UserListResult> => {
    const response = await api.get<UserListResponse>("/users", {
      params,
      signal,
    })
    return {
      users: response.data.data ?? [],
      pagination: response.data.meta?.pagination ?? {
        pageSize: params.pageSize ?? 25,
        hasNextPage: false,
        nextCursor: "",
      },
    }
  },

  get: async (id: number): Promise<ManagedUser> => {
    const response = await api.get<UserResponse>(`/users/${id}`)
    return response.data.data
  },

  create: async (payload: CreateUserPayload): Promise<ManagedUser> => {
    const response = await api.post<UserResponse>("/users", payload)
    return response.data.data
  },

  update: async (
    id: number,
    payload: UpdateUserPayload
  ): Promise<ManagedUser> => {
    const response = await api.patch<UserResponse>(`/users/${id}`, payload)
    return response.data.data
  },

  deactivate: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}
