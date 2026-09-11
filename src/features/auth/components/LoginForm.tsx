import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import axios from "axios"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/button"
import { markLoginSuccess } from "@/lib/auth-storage"
import { authService } from "@/services/authServices"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isLocked, setIsLocked] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return // Mencegah submit jika terkunci

    setLoading(true)
    setErrorMessage("")

    try {
      await authService.login({ email, password }, rememberMe)
      markLoginSuccess()
      await navigate({ to: "/" })
    } catch (error: unknown) {
      const resData = axios.isAxiosError(error)
        ? error.response?.data
        : undefined
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined
      const rawMsg = resData?.error || resData?.message || resData?.details
      const cleanMsg = rawMsg?.toLowerCase() || ""

      // Check apakah akun terkunci
      if (
        status === 403 ||
        cleanMsg === "forbidden" ||
        cleanMsg.includes("lock") ||
        cleanMsg.includes("kunci")
      ) {
        setErrorMessage(
          "Akun Anda telah dikunci selama 15 menit karena 5 kali gagal login."
        )
        setIsLocked(true) // Set state locked jadi true
      } else if (
        rawMsg &&
        cleanMsg !== "bad_request" &&
        cleanMsg !== "unauthorized"
      ) {
        setErrorMessage(rawMsg)
      } else if (status === 401 || status === 400) {
        setErrorMessage("Email atau password salah. Silakan periksa kembali.")
      } else {
        setErrorMessage(
          "Terjadi kesalahan pada server. Silakan coba lagi nanti."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {errorMessage}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        placeholder="Masukkan email"
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading || isLocked}
        autoComplete="email"
        required
      />

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-neutral-700">
            Password
          </label>
          <a
            href="#"
            className="text-xs font-medium text-neutral-600 hover:underline"
          >
            Lupa password?
          </a>
        </div>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
            disabled={loading || isLocked}
            className="border-neutral-300 pr-16 focus:border-neutral-900"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLocked}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-neutral-500 hover:text-neutral-800 disabled:opacity-50"
          >
            {showPassword ? "Sembunyikan" : "Lihat"}
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-1">
        <input
          type="checkbox"
          id="remember"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          disabled={loading || isLocked}
          className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-neutral-900 disabled:cursor-not-allowed"
        />
        <label
          htmlFor="remember"
          className="cursor-pointer text-xs text-neutral-600"
        >
          Ingat saya di perangkat ini
        </label>
      </div>

      <Button
        type="submit"
        disabled={loading || isLocked}
        className="w-full bg-[#1C1C1E] text-white hover:bg-[#2C2C2E] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Memproses..." : isLocked ? "Akun Terkunci" : "Masuk"}
      </Button>
    </form>
  )
}
