import { useQuery } from "@tanstack/react-query"
import { LoginForm } from "./LoginForm"
import { authService } from "@/services/authServices"

export function LoginView() {
  // Ambil data statistik publik dari authService
  const { data: publicStats, isLoading } = useQuery({
    queryKey: ["public-dashboard-stats"],
    queryFn: () => authService.getPublicStats(),
    staleTime: 1000 * 60 * 5, // Cache selama 5 menit
  })

  // Angka riil dari backend (dengan fallback ke 44 & 122 jika loading/gagal)
  const totalAssets = publicStats?.summary?.total_asset_types ?? 44
  const totalUnits = publicStats?.summary?.total_quantity ?? 122
  const totalRoles = 3

  // Subjek dan isi pesan draf email
  const emailSubject = encodeURIComponent("Bantuan Akses Akun Inventaris GA")
  const emailBody = encodeURIComponent(
    "Halo Admin GA,\n\nSaya ingin meminta bantuan terkait akses/pembuatan akun untuk sistem INC Inventaris.\n\nDetail Akun:\n- Nama Lengkap:\n- Divisi/Unit:\n\nTerima kasih."
  )

  // Link langsung ke Gmail Web agar pasti terbuka di tab browser baru
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=support@inilah.com&su=${emailSubject}&body=${emailBody}`

  return (
    <div className="flex min-h-screen w-full bg-white text-neutral-900">
      {/* Panel Kiri - Deskripsi & Ringkasan Statistik */}
      <div className="hidden w-4/12 flex-col justify-between bg-[#1c1c1e] p-12 text-white lg:flex">
        {/* Brand Header - Samakan Persis dengan Sidebar */}
        <div className="flex items-center">
          <img
            src="/image/Logo.png"
            alt="Logo INC"
            className="size-10.5 rounded-xl border border-[#343438] bg-[#2a2a2e] object-contain p-1.5 shadow-sm"
          />
          <span className="ml-2.5">
            <span className="block text-xs leading-3.5 font-bold text-white">
              INC Inventaris
            </span>
            <span className="block text-[10px] leading-3.25 text-[#777780]">
              General Affairs
            </span>
          </span>
        </div>

        <div className="my-auto space-y-6">
          <h2 className="text-3xl leading-snug font-semibold tracking-tight lg:text-4xl">
            Satu catatan aset untuk seluruh unit.
          </h2>
          <p className="max-w-sm text-xs leading-relaxed text-neutral-400 lg:text-sm">
            <strong className="font-semibold text-white">
              {isLoading ? "..." : totalAssets} aset
            </strong>{" "}
            General Affairs kini tercatat dengan validasi, hak akses, dan
            riwayat perubahan. Tidak ada lagi kode ganda atau harga yang tak
            terbaca.
          </p>

          {/* Counter Statistik */}
          <div className="flex space-x-12 pt-4">
            <div>
              <div className="text-2xl font-bold text-amber-400">
                {isLoading ? "..." : totalAssets}
              </div>
              <div className="text-[11px] text-neutral-400">
                aset termigrasi
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {isLoading ? "..." : totalUnits}
              </div>
              <div className="text-[11px] text-neutral-400">unit tercatat</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{totalRoles}</div>
              <div className="text-[11px] text-neutral-400">peran akses</div>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-neutral-500">
          PT. Indonesia News Center - Versi 1.0
        </div>
      </div>

      {/* Panel Kanan - Form Login */}
      <div className="flex w-full items-center justify-center p-8 lg:w-8/12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              Masuk
            </h1>
            <p className="text-sm text-neutral-500">
              Gunakan email kantor Anda.
            </p>
          </div>

          <LoginForm />

          <p className="pt-2 text-center text-xs text-neutral-500">
            Akun dibuat oleh Admin GA. Hubungi{" "}
            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline"
            >
              support@inilah.com
            </a>{" "}
            bila belum punya akses.
          </p>
        </div>
      </div>
    </div>
  )
}
