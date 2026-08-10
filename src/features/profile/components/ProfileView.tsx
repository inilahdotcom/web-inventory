import type { ReactNode } from "react"

export function ProfileView() {
  return (
    <div className="min-h-svh min-w-0 bg-[#f7f8fa] text-[#1c1c1e]">
      <header className="flex h-16 items-center border-b border-[#e0e2e8] bg-white py-0 pr-4 pl-16 text-[13px] text-[#6b6f7e] sm:px-6 lg:pl-6">
        Profil saya
      </header>
      <div className="flex min-h-[calc(100svh-64px)] justify-center bg-[#f7f8fa] p-4 sm:p-7">
        <div className="flex w-full max-w-[820px] flex-col gap-[18px]">
          <section className="flex flex-col gap-4 rounded-[20px] border border-[#eef0f3] bg-white p-5 sm:flex-row sm:items-center sm:gap-[18px] sm:p-[22px]">
            <span className="grid size-16 place-items-center rounded-full bg-[#ffc6c6] text-[20px] font-semibold text-[#600000]">
              RS
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-[22px] font-semibold tracking-[-0.3px]">
                Rizky Saputra
              </span>
              <span className="text-[13px] text-[#6b6f7e]">
                rizky.saputra@inc.co.id &middot; Admin GA
              </span>
            </span>
            <span className="flex h-10 w-fit items-center rounded-full border border-[#c7cad5] px-[17px] text-[13.5px] font-semibold sm:ml-auto">
              Ganti foto
            </span>
          </section>

          <section className="flex flex-col gap-[18px] rounded-[20px] border border-[#eef0f3] bg-white p-[22px]">
            <span className="text-[16px] font-semibold">Data akun</span>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nama lengkap">Rizky Saputra</Field>
              <Field label="Email" muted>
                rizky.saputra@inc.co.id
              </Field>
              <Field label="Peran" muted>
                Admin &mdash; hanya Admin lain yang dapat mengubah
              </Field>
              <div className="flex flex-col gap-[6px]">
                <span className="text-[13px] font-semibold">
                  Login terakhir
                </span>
                <span className="flex h-11 items-center text-[14px] text-[#555a6a]">
                  05/08/2026 09.02 &middot; 192.168.1.10
                </span>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-[18px] rounded-[20px] border border-[#eef0f3] bg-white p-[22px]">
            <span className="text-[16px] font-semibold">Ganti password</span>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <PasswordField label="Password lama" dots="••••••••" />
              <PasswordField label="Password baru" dots="••••••••••" />
              <PasswordField label="Ulangi password baru" dots="••••••••••" />
            </div>
            <div className="flex flex-col gap-[14px] sm:flex-row sm:items-center">
              <span className="text-[12px] text-[#8e91a0]">
                Minimal 8 karakter, kombinasi huruf dan angka. Disimpan sebagai
                hash argon2 (NFR-04).
              </span>
              <span className="flex h-11 w-fit items-center rounded-full bg-[#1c1c1e] px-[22px] text-[14px] font-semibold text-white sm:ml-auto">
                Simpan password
              </span>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-[20px] bg-[#fff8e0] p-5 sm:flex-row sm:items-center">
            <span className="flex flex-col gap-1">
              <span className="text-[15px] font-semibold text-[#746019]">
                Sesi aktif
              </span>
              <span className="text-[12.5px] leading-[1.5] text-[#746019]">
                Chrome &middot; Windows 11 &middot; 192.168.1.10 &mdash; sesi
                ini. Berakhir otomatis setelah 60 menit tidak aktif (FR-A02).
              </span>
            </span>
            <span className="flex h-10 w-fit shrink-0 items-center rounded-full bg-[#1c1c1e] px-[17px] text-[13.5px] font-semibold text-white sm:ml-auto">
              Keluar
            </span>
          </section>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  muted = false,
}: {
  label: string
  children: ReactNode
  muted?: boolean
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <span className="text-[13px] font-semibold">{label}</span>
      <span
        className={`flex h-11 items-center rounded-lg border px-[14px] text-[14px] ${muted ? "border-[#e0e2e8] bg-[#f7f8fa] text-[#555a6a]" : "border-[#c7cad5]"}`}
      >
        {children}
      </span>
    </div>
  )
}

function PasswordField({ label, dots }: { label: string; dots: string }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <span className="text-[13px] font-semibold">{label}</span>
      <span className="flex h-11 items-center rounded-lg border border-[#c7cad5] px-[14px] text-[15px] tracking-[3px]">
        {dots}
      </span>
    </div>
  )
}
