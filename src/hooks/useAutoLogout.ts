import { useEffect, useRef, useState, useCallback } from "react"
import { authStorage } from "@/lib/auth-storage"

const TIMEOUT_DURATION = 60 * 60 * 1000

export function useAutoLogout() {
  const [isExpired, setIsExpired] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastResetRef = useRef<number>(0)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const token = authStorage.getAccessToken()
    if (token && !isExpired) {
      timerRef.current = setTimeout(() => {
        setIsExpired(true)
      }, TIMEOUT_DURATION)
    }
  }, [isExpired])

  // Logout karena sesi habis (idle): bukan pilihan user, jadi cukup hapus
  // token lokal dan redirect, tanpa memanggil endpoint logout di backend
  const handleConfirmLogout = () => {
    setIsExpired(false)
    authStorage.clear()
    window.location.href = "/auth/login"
  }

  useEffect(() => {
    lastResetRef.current = Date.now()

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"]

    const handleUserActivity = () => {
      if (isExpired) return

      const now = Date.now()
      if (now - lastResetRef.current > 1000) {
        lastResetRef.current = now
        resetTimer()
      }
    }

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity)
    })

    resetTimer()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity)
      })
    }
  }, [isExpired, resetTimer])

  return {
    isExpired,
    confirmLogout: handleConfirmLogout,
  }
}
