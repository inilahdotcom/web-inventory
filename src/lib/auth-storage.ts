import type { LoginResponse } from "@/types/auth"

const ACCESS_TOKEN_KEY = "access_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const LOGIN_SUCCESS_KEY = "login_success"

function storages(): Storage[] {
  if (typeof window === "undefined") return []
  return [window.localStorage, window.sessionStorage]
}

function selectedStorage(): Storage | null {
  if (typeof window === "undefined") return null

  if (
    window.localStorage.getItem(ACCESS_TOKEN_KEY) ||
    window.localStorage.getItem(REFRESH_TOKEN_KEY)
  ) {
    return window.localStorage
  }

  return window.sessionStorage
}

export const authStorage = {
  getAccessToken() {
    for (const storage of storages()) {
      const token = storage.getItem(ACCESS_TOKEN_KEY)
      if (token) return token
    }
    return null
  },

  getRefreshToken() {
    for (const storage of storages()) {
      const token = storage.getItem(REFRESH_TOKEN_KEY)
      if (token) return token
    }
    return null
  },

  save(tokens: LoginResponse, rememberMe: boolean) {
    if (typeof window === "undefined") return

    this.clear()
    const storage = rememberMe ? window.localStorage : window.sessionStorage
    storage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
  },

  update(tokens: LoginResponse) {
    const storage = selectedStorage()
    if (!storage) return

    storage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
  },

  clear() {
    for (const storage of storages()) {
      storage.removeItem(ACCESS_TOKEN_KEY)
      storage.removeItem(REFRESH_TOKEN_KEY)
    }
  },
}

export function markLoginSuccess() {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(LOGIN_SUCCESS_KEY, "true")
}

export function consumeLoginSuccess() {
  if (typeof window === "undefined") return false
  const succeeded = window.sessionStorage.getItem(LOGIN_SUCCESS_KEY) === "true"
  window.sessionStorage.removeItem(LOGIN_SUCCESS_KEY)
  return succeeded
}
