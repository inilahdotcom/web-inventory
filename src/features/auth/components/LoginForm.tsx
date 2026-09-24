import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/button'
import { markLoginSuccess } from '@/lib/auth-storage'
import { authService } from '@/services/authServices'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // State untuk Modal Kirim Link Lupa Password
  const [isForgotOpen, setIsForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  const navigate = useNavigate()

  // Helper untuk membersihkan dan menerjemahkan pesan error backend Go
  const parseErrorMessage = (error: any, fallbackMessage: string): string => {
    const resData = error.response?.data
    const status = error.response?.status
    const rawMsg = resData?.message || resData?.error || resData?.details || ''
    const cleanMsg = rawMsg.toString().toLowerCase().trim()

    // 1. Jika dapat error 400 atau pesan internal 'bad_request' / 'invalid format'
    if (status === 400 || cleanMsg.includes('bad_request') || cleanMsg.includes('invalid')) {
      return 'Format email atau data yang dimasukkan tidak valid.'
    }

    // 2. Jika dapat error 401 atau 'unauthorized'
    if (status === 401 || cleanMsg.includes('unauthorized')) {
      return 'Email atau password salah. Silakan periksa kembali.'
    }

    // 3. Jika 404 / 'not found'
    if (status === 404 || cleanMsg.includes('not_found') || cleanMsg.includes('not found')) {
      return 'Email tidak terdaftar dalam sistem.'
    }

    // 4. Jika error 500
    if (status === 500) {
      return 'Terjadi gangguan pada server. Silakan coba beberapa saat lagi.'
    }

    // 5. Jika ada teks pesan khusus dari backend yang manusiawi, tampilkan
    if (rawMsg && cleanMsg !== 'bad_request' && cleanMsg !== 'unauthorized') {
      return rawMsg
    }

    return fallbackMessage
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      await authService.login({ email, password }, rememberMe)
      markLoginSuccess()

      toast.success("Login berhasil", {
        description: "Selamat datang di INC Inventaris.",
      })

      await navigate({ to: '/' })
    } catch (error: any) {
      const msg = parseErrorMessage(error, 'Gagal masuk. Silakan periksa koneksi Anda.')
      setErrorMessage(msg)
      toast.error("Gagal Masuk", { description: msg })
    } finally {
      setLoading(false)
    }
  }

  // Handler Kirim Permintaan Lupa Password (Kirim Email Link Reset)
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail.trim()) {
      toast.error("Email Wajib Diisi", { description: "Silakan masukkan alamat email Anda." })
      return
    }

    setForgotLoading(true)
    try {
      await authService.forgotPassword(forgotEmail)
      
      toast.success("Link Reset Terkirim", {
        description: "Silakan periksa inbox email Anda untuk mereset password.",
      })
      
      setIsForgotOpen(false)
      setForgotEmail('')
    } catch (error: any) {
      const msg = parseErrorMessage(error, 'Gagal memproses permintaan lupa password.')
      toast.error("Gagal Mengirim Link", { description: msg })
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="relative">
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
          disabled={loading}
          required
        />

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-neutral-700">Password</label>
            <button
              type="button"
              onClick={() => setIsForgotOpen(true)}
              className="text-xs font-medium text-neutral-600 hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              Lupa password?
            </button>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              disabled={loading}
              className="border-neutral-300 pr-16 focus:border-neutral-900"
              required
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

        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={loading}
            className="h-4 w-4 cursor-pointer rounded border-neutral-300 accent-neutral-900 disabled:cursor-not-allowed"
          />
          <label htmlFor="remember" className="cursor-pointer text-xs text-neutral-600">
            Ingat saya di perangkat ini
          </label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1C1C1E] text-white hover:bg-[#2C2C2E] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </Button>
      </form>

      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4 border border-neutral-100">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-neutral-900">Atur Ulang Password</h3>
              <p className="text-xs text-neutral-500">
                Masukkan email akun Anda. Kami akan mengirimkan link untuk mereset password.
              </p>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <Input
                label="Email Terdaftar"
                type="email"
                value={forgotEmail}
                placeholder="nama@email.com"
                onChange={(e) => setForgotEmail(e.target.value)}
                disabled={forgotLoading}
                required
              />

              <div className="flex justify-end items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  disabled={forgotLoading}
                  className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <Button
                  type="submit"
                  disabled={forgotLoading}
                  className="rounded-xl bg-neutral-900 text-xs text-white hover:bg-neutral-800 cursor-pointer"
                >
                  {forgotLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}