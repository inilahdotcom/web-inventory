import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner' // 1. Import Sonner
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

    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMessage('')

        try {
            await authService.login({ email, password }, rememberMe)
            markLoginSuccess()

            // 🚀 2. Panggil toast sukses di sini
            toast.success("Login berhasil", {
                description: "Selamat datang di INC Inventaris.",
            })

            await navigate({ to: '/' })
        } catch (error: any) {
            const resData = error.response?.data
            const status = error.response?.status
            const rawMsg = resData?.message || resData?.error || resData?.details
            const cleanMsg = rawMsg?.toLowerCase() || ''

            let msg = ''
            if (rawMsg && cleanMsg !== 'bad_request' && cleanMsg !== 'unauthorized') {
                msg = rawMsg
            } else if (status === 401 || status === 400) {
                msg = 'Email atau password salah. Silakan periksa kembali.'
            } else {
                msg = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.'
            }

            setErrorMessage(msg)
            
            // 🚀 3. Panggil toast error (opsional)
            toast.error("Gagal Masuk", { description: msg })
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
                disabled={loading}
                required
            />

            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-neutral-700">Password</label>
                    <a href="#" className="text-xs font-medium text-neutral-600 hover:underline">
                        Lupa password?
                    </a>
                </div>
                <div className="relative">
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password"
                        disabled={loading}
                        className="border-neutral-300 focus:border-neutral-900 pr-16"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-500 hover:text-neutral-800 disabled:opacity-50"
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
                    className="h-4 w-4 rounded border-neutral-300 accent-neutral-900 cursor-pointer disabled:cursor-not-allowed"
                />
                <label htmlFor="remember" className="text-xs text-neutral-600 cursor-pointer">
                    Ingat saya di perangkat ini
                </label>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1C1C1E] text-white hover:bg-[#2C2C2E] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Memproses...' : 'Masuk'}
            </Button>
        </form>
    )
}