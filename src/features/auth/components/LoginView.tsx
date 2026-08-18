import { LoginForm } from './LoginForm'

export function LoginView() {
    return (
        <div className="flex min-h-screen w-full bg-white text-neutral-900">
            <div className="hidden lg:flex w-4/12 flex-col justify-between bg-[#121212] p-12 text-white">
                <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-xs font-bold text-neutral-900">
                        GA
                    </div>
                    <span className="text-sm font-medium tracking-wide">INC Inventaris</span>
                </div>

                <div className="space-y-6 my-auto">
                    <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight leading-snug">
                        Satu catatan aset untuk seluruh unit.
                    </h2>
                    <p className="text-xs lg:text-sm text-neutral-400 leading-relaxed max-w-sm">
                        95 aset General Affairs kini tercatat dengan validasi, hak akses, dan riwayat perubahan. Tidak ada lagi kode ganda atau harga yang tak terbaca.
                    </p>
                    

                    <div className="flex space-x-12 pt-4">
                        <div>
                            <div className="text-2xl font-bold text-amber-400">95</div>
                            <div className="text-[11px] text-neutral-400">aset termigrasi</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">213</div>
                            <div className="text-[11px] text-neutral-400">unit tercatat</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">3</div>
                            <div className="text-[11px] text-neutral-400">peran akses</div>
                        </div>
                    </div>
                </div>

                <div className="text-[11px] text-neutral-500">
                    PT. Indonesia News Center - Versi 1.0
                </div>
            </div>


            <div className="flex w-full lg:w-8/12 items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Masuk</h1>
                        <p className="text-sm text-neutral-500">Gunakan email kantor Anda.</p>
                    </div>

     
                    <LoginForm />

                    <div className="rounded-lg bg-amber-50/60 p-4 border border-amber-200/50 text-xs text-neutral-600 space-y-1">
                        <span className="font-semibold text-neutral-900 block">Keamanan akun</span>
                        <p>Akun terkunci sementara 15 menit setelah 5 kali gagal (FR-A04). Sesi berakhir otomatis setelah 60 menit tidak aktif.</p>
                    </div>

                    <p className="text-xs text-neutral-500 text-center pt-2">
                        Akun dibuat oleh Admin GA. Hubungi{' '}
                        <a href="mailto:it@inc.co.id" className="text-blue-600 hover:underline">
                            it@inc.co.id
                        </a>{' '}
                        bila belum punya akses.
                    </p>
                </div>
            </div>
        </div>
    )
}