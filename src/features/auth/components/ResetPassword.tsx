import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/button'
import { authService } from '@/services/authServices'

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submit dipencet!", { token, newPassword, confirmPassword })

    if (!token) {
      toast.error('Token Tidak Valid', {
        description: 'Sesi reset password tidak ditemukan. Silakan minta link baru.',
      })
      return
    }

    // 2. Validasi Field Kosong
    if (!newPassword.trim()) {
      toast.error('Password Baru Wajib Diisi', {
        description: 'Silakan masukkan password baru Anda.',
      })
      return
    }

    if (!confirmPassword.trim()) {
      toast.error('Konfirmasi Password Wajib Diisi', {
        description: 'Silakan ulangi password baru Anda.',
      })
      return
    }

    // 3. Validasi Panjang Minimal Password (min 8 karakter)
    if (newPassword.length < 8) {
      toast.error('Password Terlalu Pendek', {
        description: 'Password minimal harus terdiri dari 8 karakter.',
      })
      return
    }

    // 4. Validasi Kesamaan Password & Konfirmasi
    if (newPassword !== confirmPassword) {
      toast.error('Password Tidak Cocok', {
        description: 'Konfirmasi password harus sama dengan password baru.',
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
      toast.success('Password Berhasil Diubah', {
        description: 'Password Anda telah diperbarui. Silakan login kembali.',
      })

      // Redirect ke halaman login
      await navigate({ to: '/auth/login' })
    } catch (error: any) {
      const status = error.response?.status
      const rawError = error.response?.data?.error || error.response?.data?.message || ''
      const cleanError = rawError.toLowerCase()

      // Penanganan Error Berdasarkan Respons Backend
      if (status === 400 && (cleanError.includes('min') || cleanError.includes('short'))) {
        toast.error('Gagal Mereset Password', {
          description: 'Password terlalu pendek. Pastikan minimal 8 karakter.',
        })
      } else if (status === 400 && (cleanError.includes('token') || cleanError.includes('expired'))) {
        toast.error('Token Kadaluarsa atau Tidak Valid', {
          description: 'Silakan lakukan permintaan reset password ulang.',
        })
      } else if (status === 404) {
        toast.error('Pengguna Tidak Ditemukan', {
          description: 'Akun yang terkait dengan token ini tidak terdaftar.',
        })
      } else if (status === 500) {
        toast.error('Gangguan Server', {
          description: 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.',
        })
      } else {
        toast.error('Gagal Mereset Password', {
          description: rawError || 'Terjadi kesalahan. Silakan periksa koneksi Anda.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl space-y-6">
        <div className="space-y-1 text-center">
          <h3 className="text-xl font-bold text-neutral-900">Reset Password</h3>
          <p className="text-xs text-neutral-500">
            Buat password baru untuk akun INC Inventaris Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700">Password Baru</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                disabled={loading}
                className="border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 pr-24 focus:border-neutral-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-500 hover:text-neutral-800 disabled:opacity-50 cursor-pointer"
              >
                {showPassword ? 'Sembunyikan' : 'Lihat'}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700">Konfirmasi Password Baru</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                disabled={loading}
                className="border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 pr-24 focus:border-neutral-900"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-500 hover:text-neutral-800 disabled:opacity-50 cursor-pointer"
              >
                {showConfirmPassword ? 'Sembunyikan' : 'Lihat'}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1C1C1E] text-white hover:bg-[#2C2C2E] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer pt-1"
          >
            {loading ? 'Memproses...' : 'Simpan Password Baru'}
          </Button>
        </form>
      </div>
    </div>
  )
}