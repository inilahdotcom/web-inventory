import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/button'

export function LoginForm() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMessage('')

        try {
            const payload = { email, password, rememberMe }
            console.log('Mengirim data login ke API:', payload)
            alert('Login berhasil!')

        } catch (error: any) {
            console.error('Login gagal:', error)
            setErrorMessage(error.response?.data?.message || 'Email atau password salah. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                    {errorMessage}
                </div>
            )}

            <Input 
                label="Email"
                type="email"
                value={email}
                placeholder="Masukan email"
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-neutral-500 hover:text-neutral-800"
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
                    className="h-4 w-4 rounded border-neutral-300 accent-neutral-900 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-neutral-600 cursor-pointer">
                    Ingat saya di perangkat ini
                </label>
            </div>

            <Button 
                type="submit" 
                disabled={loading} 
                className="w-full"
            >
                {loading ? 'Memproses...' : 'Masuk'}
            </Button>
        </form>
    )
}