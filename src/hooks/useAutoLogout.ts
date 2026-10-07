import { useEffect, useRef, useState, useCallback } from "react"
import { authService } from "@/services/authServices"
import { authStorage } from "@/lib/auth-storage"

// Durasi timeout (10 detik untuk testing, ganti ke 60 * 60 * 1000 untuk 60 menit)
const TIMEOUT_DURATION = 10 * 1000

export function useAutoLogout() {
  const [isExpired, setIsExpired] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastResetRef = useRef<number>(0)

  const resetTimer = useCallback(() => {
    // Hapus timer lama
    if (timerRef.current) clearTimeout(timerRef.current)

    // Jalankan timer baru jika user sudah login dan modal belum aktif
    const token = authStorage.getAccessToken()
    if (token && !isExpired) {
      timerRef.current = setTimeout(() => {
        setIsExpired(true)
      }, TIMEOUT_DURATION)
    }
  }, [isExpired])

  const handleConfirmLogout = () => {
    setIsExpired(false)
    authService.logout()
  }

  useEffect(() => {
    // Inisialisasi lastResetRef di dalam useEffect agar tidak memicu error impure function
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
