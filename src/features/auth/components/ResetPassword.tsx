import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { authService } from "@/services/authServices"

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error("Token Tidak Valid", {
        description:
          "Sesi reset password tidak ditemukan. Silakan minta link baru.",
      })
      return
    }

    // 2. Validasi Field Kosong
    if (!newPassword.trim()) {
      toast.error("Password Baru Wajib Diisi", {
        description: "Silakan masukkan password baru Anda.",
      })
      return
    }

    if (!confirmPassword.trim()) {
      toast.error("Konfirmasi Password Wajib Diisi", {
        description: "Silakan ulangi password baru Anda.",
      })
      return
    }

    // 3. Validasi Panjang Minimal Password (min 8 karakter)
    if (newPassword.length < 8) {
      toast.error("Password Terlalu Pendek", {
        description: "Password minimal harus terdiri dari 8 karakter.",
      })
      return
    }

    // 4. Validasi Kesamaan Password & Konfirmasi
    if (newPassword !== confirmPassword) {
      toast.error("Password Tidak Cocok", {
        description: "Konfirmasi password harus sama dengan password baru.",
      })
      return
    }

    setLoading(true)

    try {
      // 5. Panggil API Reset Password
      await authService.resetPassword({
        token: token,
        new_password: newPassword,
      })

      // Toast Sukses
      toast.success("Password Berhasil Diubah", {
        description: "Password Anda telah diperbarui. Silakan login kembali.",
      })

      // Redirect ke halaman login
      await navigate({ to: "/auth/login" })
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number
          data?: { error?: string; message?: string }
        }
      }
      const status = err?.response?.status
      const rawError =
        err?.response?.data?.error || err?.response?.data?.message || ""
      const cleanError = rawError.toLowerCase()

      // Penanganan Error Berdasarkan Respons Backend
      if (
        status === 400 &&
        (cleanError.includes("min") || cleanError.includes("short"))
      ) {
        toast.error("Gagal Mereset Password", {
          description: "Password terlalu pendek. Pastikan minimal 8 karakter.",
        })
      } else if (
        status === 400 &&
        (cleanError.includes("token") || cleanError.includes("expired"))
      ) {
        toast.error("Token Kadaluarsa atau Tidak Valid", {
          description: "Silakan lakukan permintaan reset password ulang.",
        })
      } else if (status === 404) {
        toast.error("Pengguna Tidak Ditemukan", {
          description: "Akun yang terkait dengan token ini tidak terdaftar.",
        })
      } else if (status === 500) {
        toast.error("Gangguan Server", {
          description:
            "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.",
        })
      } else {
        toast.error("Gagal Mereset Password", {
          description:
            rawError || "Terjadi kesalahan. Silakan periksa koneksi Anda.",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Buat password baru untuk akun INC Inventaris Anda.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Password Baru</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  disabled={loading}
                  className="pr-20"
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

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  disabled={loading}
                  className="pr-20"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-1 h-8 -translate-y-1/2 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
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

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Memproses..." : "Simpan Password Baru"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
