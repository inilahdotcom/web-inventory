import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { markLoginSuccess } from "@/lib/auth-storage"
import { authService } from "@/services/authServices"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [isForgotOpen, setIsForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotLoading, setForgotLoading] = useState(false)

  const navigate = useNavigate()

  // Helper untuk membersihkan dan menerjemahkan pesan error backend Go
  const parseErrorMessage = (
    error: unknown,
    fallbackMessage: string
  ): string => {
    const err = error as {
      response?: {
        data?: { error?: unknown; message?: unknown }
        status?: number
      }
    }
    const resData = err?.response?.data
    const status = err?.response?.status

    // Ambil teks dari error maupun message agar tidak terlewat
    const rawError = resData?.error ? String(resData.error) : ""
    const rawMsg = resData?.message ? String(resData.message) : ""
    const fullErrString = `${rawError} ${rawMsg}`.toLowerCase().trim()

    // 1. Cek jika akun dinonaktifkan (Paling Prioritas)
    if (
      fullErrString.includes("account is inactive") ||
      fullErrString.includes("account_inactive") ||
      fullErrString.includes("inactive")
    ) {
      return "Akun Anda dinonaktifkan. Silakan hubungi Admin GA."
    }

    // 2. Format request tidak valid
    if (
      status === 400 ||
      fullErrString.includes("bad_request") ||
      fullErrString.includes("invalid")
    ) {
      return "Format email atau data yang dimasukkan tidak valid."
    }

    // 3. Email atau Password Salah
    if (status === 401 || fullErrString.includes("unauthorized")) {
      return "Email atau password salah. Silakan periksa kembali."
    }

    // 4. Email Tidak Terdaftar
    if (status === 404 || fullErrString.includes("not_found")) {
      return "Email tidak terdaftar dalam sistem."
    }

    // 5. Gangguan Server
    if (status === 500) {
      return "Terjadi gangguan pada server. Silakan coba beberapa saat lagi."
    }

    if (rawError || rawMsg) {
      return rawError || rawMsg
    }

    return fallbackMessage
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")

    try {
      await authService.login({ email, password }, rememberMe)
      markLoginSuccess()
      toast.success("Login berhasil", {
        description: "Selamat datang di INC Inventaris.",
      })
      await navigate({ to: "/" })
    } catch (error: unknown) {
      const msg = parseErrorMessage(
        error,
        "Gagal masuk. Silakan periksa koneksi Anda."
      )
      setErrorMessage(msg)
      // toast.error khusus login gagal dihilangkan di sini agar pesan error fokus di Alert bawah judul form
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail.trim()) {
      toast.error("Email Wajib Diisi", {
        description: "Silakan masukkan alamat email Anda.",
      })
      return
    }
    setForgotLoading(true)
    try {
      await authService.forgotPassword(forgotEmail)
      toast.success("Link Reset Terkirim", {
        description: "Silakan periksa inbox email Anda untuk mereset password.",
      })
      setIsForgotOpen(false)
      setForgotEmail("")
    } catch (error: unknown) {
      const msg = parseErrorMessage(
        error,
        "Gagal memproses permintaan lupa password."
      )
      toast.error("Gagal Mengirim Link", { description: msg })
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            value={email}
            placeholder="Masukkan email"
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => setIsForgotOpen(true)}
              className="h-auto p-0 text-xs text-muted-foreground"
            >
              Lupa password?
            </Button>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              disabled={loading}
              className="pr-16"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-1 h-8 -translate-y-1/2 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <>
                  <EyeOff className="mr-1 size-3.5" />
                  Sembunyikan
                </>
              ) : (
                <>
                  <Eye className="mr-1 size-3.5" />
                  Lihat
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Remember Me */}
        <Checkbox
          id="remember"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          disabled={loading}
          label="Ingat saya di perangkat ini"
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      {/* Dialog Lupa Password */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Atur Ulang Password</DialogTitle>
            <DialogDescription>
              Masukkan email akun Anda. Kami akan mengirimkan link untuk mereset
              password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email">Email Terdaftar</Label>
              <Input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                placeholder="nama@email.com"
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={forgotLoading}
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsForgotOpen(false)}
                disabled={forgotLoading}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={forgotLoading}>
                {forgotLoading ? "Mengirim..." : "Kirim Link Reset"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
